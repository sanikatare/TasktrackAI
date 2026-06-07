import { Router, Response } from 'express';
import { Task } from '../models/Task';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';
import axios from 'axios';

const router = Router();
router.use(authenticate); // all task routes require auth

const AI_SERVICE_URL = () => process.env.AI_SERVICE_URL ?? 'http://localhost:8000';

// GET /api/tasks  — list all tasks for current user
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, priority, subject } = req.query;
    const filter: Record<string, unknown> = { userId: req.uid };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (subject)  filter.subject  = new RegExp(String(subject), 'i');

    const tasks = await Task.find(filter).sort({ deadline: 1, priority: -1 }).lean();
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

// POST /api/tasks  — create a new task
router.post('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const { title, subject, category, description, deadline, estimatedHours, priority, difficulty, tags } = req.body;
    if (!title || !subject || !deadline || !estimatedHours) throw new AppError('Missing required fields');

    // Optionally get AI time prediction
    let aiPredictedHours: number | undefined;
    try {
      const aiResp = await axios.post(`${AI_SERVICE_URL()}/predict-time`, {
        subject, category, difficulty: difficulty ?? 3, estimatedHours,
      }, { timeout: 3000 });
      aiPredictedHours = aiResp.data.predicted_hours;
    } catch { /* AI service optional */ }

    const task = await Task.create({
      userId: req.uid,
      title, subject, category: category ?? 'other', description,
      deadline: new Date(deadline as string),
      estimatedHours, priority, difficulty: difficulty ?? 3,
      tags: tags ?? [],
      aiPredictedHours,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
});

// GET /api/tasks/:id
router.get('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.uid });
    if (!task) throw new AppError('Task not found', 404);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
});

// PUT /api/tasks/:id  — update task
router.put('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const allowed = ['title','subject','category','description','deadline','estimatedHours','priority','status','difficulty','tags','actualHours'];
    const updates: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in req.body) updates[k] = req.body[k];
    }
    if (updates.deadline) updates.deadline = new Date(updates.deadline as string);

    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.uid }, updates, { new: true });
    if (!task) throw new AppError('Task not found', 404);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.uid });
    if (!task) throw new AppError('Task not found', 404);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
});

// PATCH /api/tasks/:id/complete  — mark a task done
router.patch('/:id/complete', async (req: AuthRequest, res: Response, next) => {
  try {
    const { actualHours, productivityScore } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.uid },
      { status: 'completed', completedAt: new Date(), actualHours },
      { new: true }
    );
    if (!task) throw new AppError('Task not found', 404);

    // Send performance data to AI service for model re-training
    try {
      await axios.post(`${AI_SERVICE_URL()}/update-model`, {
        subject: task.subject, category: task.category,
        difficulty: task.difficulty, estimatedHours: task.estimatedHours,
        actualHours: actualHours ?? task.estimatedHours, productivityScore: productivityScore ?? 7,
      }, { timeout: 3000 });
    } catch { /* non-blocking */ }

    res.json({ success: true, data: task });
  } catch (err) { next(err); }
});

// PATCH /api/tasks/:id/skip  — mark task as skipped and reschedule
router.patch('/:id/skip', async (req: AuthRequest, res: Response, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.uid },
      { status: 'skipped' },
      { new: true }
    );
    if (!task) throw new AppError('Task not found', 404);
    res.json({ success: true, data: task, message: 'Task skipped — regenerate your schedule to reschedule' });
  } catch (err) { next(err); }
});

export default router;
