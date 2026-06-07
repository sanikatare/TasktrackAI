import { useQuery } from '@tanstack/react-query';
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Sparkles, ArrowRight, Flame, Target, Zap, BookOpen } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import type { Analytics, AIRecommendation } from '@/types';
import { deadlineLabel, deadlineUrgency, hoursToReadable, formatDate } from '@/utils/dateUtils';
import { PRIORITY_CONFIG } from '@/config/constants';
import clsx from 'clsx';

function StatCard({ label, value, sub, icon: Icon, gradient, delay }:
  { label: string; value: string | number; sub?: string; icon: React.ElementType; gradient: string; delay: number }) {
  return (
    <div
      className="card p-5 group hover:border-brand-200/60 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.06em]">{label}</div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: gradient }}
        >
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
      </div>
      <div className="stat-number mb-1">{value}</div>
      {sub && <div className="text-xs text-slate-400 font-medium">{sub}</div>}
    </div>
  );
}

function UpcomingTask({ task, index }: { task: Analytics['upcomingDeadlines'][0]; index: number }) {
  const urgency = deadlineUrgency(task.deadline);
  const urgencyColors = {
    critical: 'bg-red-500',
    warning: 'bg-amber-400',
    safe: 'bg-brand-400',
  };
  const urgencyTextColors = {
    critical: 'text-red-600',
    warning: 'text-amber-600',
    safe: 'text-slate-500',
  };

  return (
    <div
      className="flex items-center gap-4 py-3.5 px-1 border-b border-slate-100/80 last:border-0 hover:bg-slate-50/50 rounded-lg transition-colors -mx-1 px-3"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={clsx('w-1 h-10 rounded-full shrink-0', urgencyColors[urgency])} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800 truncate">{task.title}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400 font-medium">{task.subject}</span>
          <span className={clsx('badge text-[10px]', PRIORITY_CONFIG[task.priority].bg)}>
            {PRIORITY_CONFIG[task.priority].label}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={clsx('text-xs font-semibold', urgencyTextColors[urgency])}>
          {deadlineLabel(task.deadline)}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(task.deadline, 'MMM d')}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => (await apiClient.get('/analytics')).data.data,
  });

  const { data: recommendation } = useQuery<AIRecommendation>({
    queryKey: ['recommendation'],
    queryFn: async () => (await apiClient.get('/ai/recommend')).data.data,
  });

  const completionRate = analytics?.completionRate ?? 0;
  const streakDays = analytics?.streakDays ?? 0;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="page-shell space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 35%, #2563eb 70%, #3b82f6 100%)',
      }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" style={{ transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl" style={{ transform: 'translate(-20%, 40%)' }} />
        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-blue-300/40 animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              {streakDays > 0 && (
                <div className="streak-badge mb-4 inline-flex">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{streakDays}-day streak! Keep it up</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Good {getGreeting()}, {user?.displayName?.split(' ')[0]} 👋
              </h1>
              <p className="text-blue-100/80 text-sm sm:text-base max-w-lg font-medium">
                {pendingCount > 0
                  ? `You have ${pendingCount} pending task${pendingCount > 1 ? 's' : ''} waiting. Let's make progress today!`
                  : "You're all caught up! Great work staying on top of things."}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-extrabold tracking-tight">{completionRate.toFixed(0)}%</div>
                <div className="text-xs text-blue-200/80 font-medium mt-0.5">Completion Rate</div>
              </div>
              <div className="w-14 h-14 rounded-full border-3 border-white/20 flex items-center justify-center relative">
                <svg className="w-14 h-14 -rotate-90 absolute" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="4"
                    strokeDasharray={`${(completionRate / 100) * 150.8} 150.8`}
                    strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-blue-200/70 font-medium">
              <Target className="w-3.5 h-3.5" />
              <span>{analytics?.completedTasks ?? 0} completed</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5 text-xs text-blue-200/70 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{hoursToReadable(analytics?.totalStudyHours ?? 0)} studied</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5 text-xs text-blue-200/70 font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{analytics?.totalTasks ?? 0} total tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Completion" value={`${completionRate.toFixed(0)}%`}
          sub={`${analytics?.completedTasks ?? 0} of ${analytics?.totalTasks ?? 0} tasks`}
          icon={CheckCircle2} gradient="linear-gradient(135deg, #2563eb, #1d4ed8)" delay={0} />
        <StatCard label="Study Hours" value={hoursToReadable(analytics?.totalStudyHours ?? 0)}
          sub="Total logged" icon={Clock} gradient="linear-gradient(135deg, #3b82f6, #2563eb)" delay={80} />
        <StatCard label="Pending" value={analytics?.pendingTasks ?? 0}
          sub="Awaiting completion" icon={TrendingUp} gradient="linear-gradient(135deg, #64748b, #475569)" delay={160} />
        <StatCard label="Productivity" value={`${(analytics?.avgProductivityScore ?? 0).toFixed(1)}/10`}
          sub="Average score" icon={Sparkles} gradient="linear-gradient(135deg, #10b981, #059669)" delay={240} />
      </div>

      {/* Progress Bar Card */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold text-slate-800">Overall Progress</div>
            <div className="text-xs text-slate-400 mt-0.5">Your task completion this period</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-extrabold text-brand-600 tracking-tight">{completionRate.toFixed(0)}%</div>
            <div className={clsx(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              completionRate >= 70 ? 'bg-emerald-50 text-emerald-600' :
              completionRate >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
            )}>
              {completionRate >= 70 ? 'Great' : completionRate >= 40 ? 'Good' : 'Start'}
            </div>
          </div>
        </div>
        <div className="progress-bar h-3">
          <div className="progress-fill" style={{ width: `${completionRate}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-3 font-medium">
          <span>{analytics?.completedTasks ?? 0} completed</span>
          <span>{analytics?.pendingTasks ?? 0} remaining</span>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Recommendation */}
        {recommendation && (
          <div className="lg:col-span-3 card-accent p-5 sm:p-6 group">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-100/80">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              </div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-[0.06em]">AI Recommendation</span>
            </div>

            <div className="text-lg font-bold text-slate-900 mb-2 leading-snug">{recommendation.nextTask.title}</div>
            <div className="text-sm text-slate-600 mb-4 leading-relaxed">{recommendation.reason}</div>

            <div className="flex items-center gap-3 mb-4">
              <span className={clsx('badge text-xs', PRIORITY_CONFIG[recommendation.nextTask.priority].bg)}>
                {PRIORITY_CONFIG[recommendation.nextTask.priority].label} Priority
              </span>
              <span className="text-xs text-slate-400 font-medium">{deadlineLabel(recommendation.nextTask.deadline)}</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-100/60">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-brand-500" />
                <span className="text-xs text-slate-500 font-medium">
                  Urgency: <span className="font-bold text-brand-600">{recommendation.urgencyScore}/10</span>
                </span>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors group/btn">
                Start now
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        <div className={clsx('card p-5 sm:p-6', !recommendation && 'lg:col-span-5')}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.06em]">Upcoming Deadlines</span>
          </div>
          {(analytics?.upcomingDeadlines ?? []).length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-slate-50">
                <CheckCircle2 className="w-6 h-6 text-slate-300" />
              </div>
              <div className="text-sm text-slate-400 font-medium">No upcoming deadlines</div>
              <div className="text-xs text-slate-300 mt-1">You're all caught up!</div>
            </div>
          ) : (
            (analytics?.upcomingDeadlines ?? []).slice(0, 5).map((task, i) => (
              <UpcomingTask key={task._id} task={task} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
