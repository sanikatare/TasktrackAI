import { Router, Response } from 'express';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { Task } from '../models/Task';
import { AIStudyPlan } from '../models/AIStudyPlan';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';
import { buildStudyPlanPrompt } from '../services/claudePrompts';

const router = Router();
router.use(authenticate);

const AI_SERVICE_URL = () => process.env.AI_SERVICE_URL ?? 'http://localhost:8000';

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// GET /api/ai/recommend  — next best task recommendation
router.get('/recommend', async (req: AuthRequest, res: Response, next) => {
  try {
    const tasks = await Task.find({
      userId: req.uid,
      status: { $in: ['pending', 'in_progress'] },
    }).sort({ deadline: 1 }).lean();

    if (tasks.length === 0) {
      res.json({ success: true, data: null });
      return;
    }

    // Call AI service for recommendation
    const aiResp = await axios.post(`${AI_SERVICE_URL()}/recommend`, {
      tasks: tasks.map(t => ({
        id: t._id.toString(),
        title: t.title,
        subject: t.subject,
        deadline: t.deadline.toISOString(),
        estimated_hours: t.estimatedHours,
        priority: t.priority,
        difficulty: t.difficulty,
      })),
    }, { timeout: 5000 });

    const { recommended_task_id, reason, urgency_score, alternative_task_ids } = aiResp.data;

    const nextTask = tasks.find(t => t._id.toString() === recommended_task_id) ?? tasks[0];
    const altTasks = tasks.filter(t => alternative_task_ids?.includes(t._id.toString())).slice(0, 3);

    res.json({
      success: true,
      data: {
        nextTask,
        reason:           reason ?? 'Closest deadline with high priority',
        urgencyScore:     urgency_score ?? 7,
        alternativeTasks: altTasks,
      },
    });
  } catch (err) {
    // Fallback: simple deadline-priority scoring
    try {
      const tasks = await Task.find({ userId: req.uid, status: 'pending' }).sort({ deadline: 1 }).lean();
      if (tasks.length > 0) {
        res.json({
          success: true,
          data: {
            nextTask:         tasks[0],
            reason:           'Nearest deadline — recommended by fallback scheduler',
            urgencyScore:     8,
            alternativeTasks: tasks.slice(1, 3),
          },
        });
      } else {
        res.json({ success: true, data: null });
      }
    } catch (fallbackErr) { next(fallbackErr); }
  }
});

// POST /api/ai/generate-plan  — generate Claude AI study plan
router.post('/generate-plan', async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId } = req.body;
    if (!taskId) throw new AppError('taskId is required');

    const [task, user] = await Promise.all([
      Task.findOne({ _id: taskId, userId: req.uid }).lean(),
      User.findOne({ uid: req.uid }).lean(),
    ]);
    if (!task) throw new AppError('Task not found', 404);

    if (!anthropic) throw new AppError('Anthropic API key not configured', 503);

    const prompt = buildStudyPlanPrompt(
      {
        title: task.title,
        subject: task.subject,
        category: task.category,
        description: task.description,
        deadline: task.deadline,
        estimatedHours: task.estimatedHours,
        difficulty: task.difficulty,
        priority: task.priority,
      },
      user ? {
        studyHoursPerDay: user.studyHoursPerDay,
        currentSemester: user.currentSemester,
        subjects: user.subjects,
      } : null,
    );

    // Call Claude API
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You are an expert academic coach and study planner for engineering students.
Your job is to create detailed, actionable, and realistic study plans.
Always respond with valid JSON only — no markdown, no preamble.`,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';

    let parsed;
    try {
      parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
    } catch {
      throw new AppError('AI returned malformed JSON', 500);
    }

    // Save plan to DB (upsert)
    const plan = await AIStudyPlan.findOneAndUpdate(
      { taskId, userId: req.uid },
      {
        userId: req.uid,
        taskId,
        planText:      parsed.summary ?? '',
        breakdown:     parsed.breakdown ?? [],
        estimatedDays: parsed.estimated_days ?? 7,
        dailyGoals:    parsed.daily_goals ?? [],
        resources:     parsed.resources ?? [],
        generatedAt:   new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
});

// GET /api/ai/plan/:taskId  — fetch existing plan
router.get('/plan/:taskId', async (req: AuthRequest, res: Response, next) => {
  try {
    const plan = await AIStudyPlan.findOne({ taskId: req.params.taskId, userId: req.uid });
    res.json({ success: true, data: plan ?? null });
  } catch (err) { next(err); }
});

export default router;
