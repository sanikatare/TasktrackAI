import { Router, Response } from 'express';
import axios from 'axios';
import { Task } from '../models/Task';
import { ScheduleBlock } from '../models/ScheduleBlock';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';
import { createCalendarEvents } from '../services/googleCalendar';

const router = Router();
router.use(authenticate);

const AI_SERVICE_URL = () => process.env.AI_SERVICE_URL ?? 'http://localhost:8000';

// GET /api/schedule  — fetch all schedule blocks (populate task info)
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter: Record<string, unknown> = { userId: req.uid };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, string>).$gte = String(startDate);
      if (endDate)   (filter.date as Record<string, string>).$lte = String(endDate);
    }

    const blocks = await ScheduleBlock.find(filter)
      .populate('taskId', 'title subject priority deadline estimatedHours status')
      .sort({ date: 1, startTime: 1 })
      .lean();

    // Rename populated taskId → task for clean frontend
    const result = blocks.map(b => {
      const populated = b.taskId as unknown as { _id: string; title?: string } | null;
      const taskId = populated?._id?.toString?.() ?? String(b.taskId);
      return { ...b, task: populated, taskId };
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// POST /api/schedule/generate  — call AI service to build optimized schedule
router.post('/generate', async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findOne({ uid: req.uid });
    if (!user) throw new AppError('User not found', 404);

    // Fetch all non-completed tasks
    const tasks = await Task.find({ userId: req.uid, status: { $in: ['pending','in_progress','skipped'] } })
      .sort({ deadline: 1 }).lean();

    if (tasks.length === 0) {
      res.json({ success: true, data: { schedule: [], warnings: ['No pending tasks to schedule'] } });
      return;
    }

    // Call FastAPI AI service
    const aiPayload = {
      tasks: tasks.map(t => ({
        id: t._id.toString(),
        title: t.title,
        subject: t.subject,
        deadline: t.deadline.toISOString(),
        estimated_hours: t.aiPredictedHours ?? t.estimatedHours,
        priority: t.priority,
        difficulty: t.difficulty,
        status: t.status,
      })),
      study_hours_per_day: user.studyHoursPerDay,
      preferred_times: user.preferredStudyTimes,
      start_date: new Date().toISOString().split('T')[0],
    };

    const aiResp = await axios.post(`${AI_SERVICE_URL()}/optimize-schedule`, aiPayload, { timeout: 30000 });
    const { schedule: aiBlocks, feasibility_score, warnings, optimization_notes } = aiResp.data;

    // Persist new schedule blocks (replace existing future ones)
    const today = new Date().toISOString().split('T')[0];
    await ScheduleBlock.deleteMany({ userId: req.uid, date: { $gte: today }, isCompleted: false });

    const blocksToInsert = aiBlocks.map((b: {
      task_id: string; date: string; start_time: string;
      end_time: string; duration_minutes: number;
    }) => ({
      userId: req.uid,
      taskId: b.task_id,
      date:   b.date,
      startTime: b.start_time,
      endTime:   b.end_time,
      durationMinutes: b.duration_minutes,
    }));

    const saved = await ScheduleBlock.insertMany(blocksToInsert);

    res.json({
      success: true,
      data: {
        schedule: saved,
        feasibilityScore: feasibility_score,
        warnings,
        optimizationNotes: optimization_notes,
      },
    });
  } catch (err) { next(err); }
});

// POST /api/schedule/sync-calendar  — push blocks to Google Calendar
router.post('/sync-calendar', async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findOne({ uid: req.uid });
    if (!user?.googleCalendarConnected) throw new AppError('Google Calendar not connected', 400);

    const today = new Date().toISOString().split('T')[0];
    const blocks = await ScheduleBlock.find({
      userId: req.uid, date: { $gte: today }, isCompleted: false,
    }).populate('taskId').lean();

    const results = await createCalendarEvents(user, blocks as never);
    res.json({ success: true, data: { synced: results.length } });
  } catch (err) { next(err); }
});

// PATCH /api/schedule/:id/complete
router.patch('/:id/complete', async (req: AuthRequest, res: Response, next) => {
  try {
    const block = await ScheduleBlock.findOneAndUpdate(
      { _id: req.params.id, userId: req.uid },
      { isCompleted: true },
      { new: true }
    );
    if (!block) throw new AppError('Schedule block not found', 404);
    res.json({ success: true, data: block });
  } catch (err) { next(err); }
});

export default router;
