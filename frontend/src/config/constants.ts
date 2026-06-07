// ─── API Endpoints ────────────────────────────────────────────────────────────

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const AI_BASE_URL  = import.meta.env.VITE_AI_BASE_URL  || 'http://localhost:8000';

export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN:     '/auth/login',
  AUTH_REGISTER:  '/auth/register',
  AUTH_ME:        '/auth/me',
  AUTH_LOGOUT:    '/auth/logout',

  // Tasks
  TASKS:          '/tasks',
  TASK_BY_ID:     (id: string) => `/tasks/${id}`,
  TASK_COMPLETE:  (id: string) => `/tasks/${id}/complete`,
  TASK_SKIP:      (id: string) => `/tasks/${id}/skip`,

  // Schedule
  SCHEDULE:         '/schedule',
  SCHEDULE_GENERATE:'/schedule/generate',
  SCHEDULE_SYNC:    '/schedule/sync-calendar',

  // Analytics
  ANALYTICS:        '/analytics',
  ANALYTICS_WEEKLY: '/analytics/weekly',

  // AI Service
  AI_PREDICT:       '/predict-time',
  AI_RECOMMEND:     '/recommend',
  AI_SCHEDULE:      '/optimize-schedule',
  AI_PLAN:          '/generate-plan',

  // Google Calendar
  CALENDAR_AUTH:    '/calendar/auth',
  CALENDAR_SYNC:    '/calendar/sync',
} as const;

// ─── Priority Config ──────────────────────────────────────────────────────────

export const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#ef4444', bg: 'badge-high',   weight: 3 },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'badge-medium', weight: 2 },
  low:    { label: 'Low',    color: '#22c55e', bg: 'badge-low',    weight: 1 },
} as const;

export const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: '#64748b' },
  in_progress: { label: 'In Progress', color: '#2563eb' },
  completed:   { label: 'Completed',   color: '#10b981' },
  skipped:     { label: 'Skipped',     color: '#f59e0b' },
} as const;

export const CATEGORY_CONFIG = {
  math:        { label: 'Mathematics',   icon: 'calculator' },
  science:     { label: 'Science',        icon: 'flask' },
  programming: { label: 'Programming',   icon: 'code-2' },
  theory:      { label: 'Theory',         icon: 'book-open' },
  lab:         { label: 'Lab Work',       icon: 'microscope' },
  project:     { label: 'Project',        icon: 'folder-kanban' },
  other:       { label: 'Other',          icon: 'more-horizontal' },
} as const;

// ─── Chart Colors ─────────────────────────────────────────────────────────────

export const CHART_COLORS = {
  primary: '#2563eb',
  light:   '#60a5fa',
  navy:    '#1e40af',
  silver:  '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  danger:  '#ef4444',
};

export const CHART_GRADIENT_BLUE  = ['rgba(28,57,187,0.8)', 'rgba(28,57,187,0.1)'];
export const CHART_GRADIENT_GOLD  = ['rgba(200,169,81,0.8)', 'rgba(200,169,81,0.1)'];

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Moderate',
  4: 'Hard',
  5: 'Very Hard',
};
