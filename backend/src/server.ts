import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './utils/database';
import { initFirebaseAdmin } from './utils/firebaseAdmin';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { startNotificationScheduler } from './services/notifications';

// Route imports
import authRoutes     from './routes/auth';
import taskRoutes     from './routes/tasks';
import scheduleRoutes from './routes/schedule';
import analyticsRoutes from './routes/analytics';
import aiRoutes       from './routes/ai';
import calendarRoutes from './routes/calendar';

dotenv.config();

const app  = express();
const PORT = process.env.PORT ?? 5000;

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  message:  { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/schedule',  scheduleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/calendar',  calendarRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler
app.use(errorHandler);

// ─── Boot ─────────────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  initFirebaseAdmin();
  startNotificationScheduler();
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  logger.error('Bootstrap error:', err);
  process.exit(1);
});

export default app;
