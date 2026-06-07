import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Zap, RefreshCw, ExternalLink, Clock, CheckCheck, Sparkles } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import type { ScheduleBlock, AIScheduleResult } from '@/types';
import { DAYS_OF_WEEK } from '@/config/constants';
import { formatDate, getCurrentWeekDates } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function TimelineBlock({ block, index }: { block: ScheduleBlock; index: number }) {
  return (
    <div
      className={clsx(
        'p-4 rounded-xl border transition-all duration-300 animate-fade-up relative',
        block.isCompleted
          ? 'bg-emerald-50/60 border-emerald-200/60 opacity-75'
          : 'card border-slate-200/60 hover:border-brand-200/60'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Time indicator bar */}
      <div className={clsx(
        'absolute left-0 top-3 bottom-3 w-1 rounded-full',
        block.isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-b from-brand-500 to-brand-300'
      )} />

      <div className="flex items-start gap-3 pl-2">
        <div className="flex-1 min-w-0">
          <div className={clsx(
            'font-semibold text-sm truncate',
            block.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'
          )}>
            {block.task?.title ?? 'Study Block'}
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{block.startTime} – {block.endTime}</span>
            </div>
            {block.task?.subject && (
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                {block.task.subject}
              </span>
            )}
          </div>
        </div>
        {block.isCompleted && (
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const qc = useQueryClient();
  const weekDates = getCurrentWeekDates();
  const todayIndex = new Date().getDay();
  const [selectedDate, setSelectedDate] = useState(weekDates[todayIndex]);

  const { data: schedule, isLoading } = useQuery<ScheduleBlock[]>({
    queryKey: ['schedule'],
    queryFn: async () => (await apiClient.get('/schedule')).data.data,
  });

  const generateMutation = useMutation({
    mutationFn: async () => (await apiClient.post<{ data: AIScheduleResult }>('/schedule/generate')).data.data,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['schedule'] });
      toast.success(`Schedule generated — ${result.schedule.length} blocks created`);
    },
    onError: () => toast.error('Failed to generate schedule'),
  });

  const syncMutation = useMutation({
    mutationFn: async () => apiClient.post('/schedule/sync-calendar'),
    onSuccess: () => toast.success('Synced with Google Calendar'),
    onError: () => toast.error('Calendar sync failed'),
  });

  const selectedBlocks = (schedule ?? []).filter(b => b.date === selectedDate);

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">AI-optimized study timeline</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} className="btn-ghost text-sm">
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">{syncMutation.isPending ? 'Syncing...' : 'Sync Calendar'}</span>
          </button>
          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="btn-primary">
            {generateMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generateMutation.isPending ? 'Optimizing...' : 'Generate Schedule'}
          </button>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="card p-2 mb-6">
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((date, i) => {
            const dayBlocks = (schedule ?? []).filter(b => b.date === date);
            const isToday = i === todayIndex;
            const isSelected = date === selectedDate;
            return (
              <button key={date} onClick={() => setSelectedDate(date)}
                className={clsx(
                  'flex flex-col items-center py-3 px-1 rounded-xl transition-all duration-200 relative',
                  isSelected
                    ? 'text-white shadow-glow-sm'
                    : isToday
                      ? 'bg-brand-50/80 text-brand-700 hover:bg-brand-100/60'
                      : 'text-slate-600 hover:bg-slate-50'
                )}
                style={isSelected ? { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' } : {}}
              >
                <span className={clsx('text-[10px] font-bold uppercase tracking-wider', isSelected ? 'text-blue-200' : 'text-slate-400')}>
                  {DAYS_OF_WEEK[i]}
                </span>
                <span className={clsx('text-lg font-extrabold mt-0.5', isSelected ? 'text-white' : 'text-slate-800')}>
                  {new Date(date).getDate()}
                </span>
                {dayBlocks.length > 0 && (
                  <div className="flex gap-0.5 mt-1.5">
                    {[...Array(Math.min(dayBlocks.length, 3))].map((_, j) => (
                      <div key={j} className={clsx('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/80' : 'bg-brand-400')} />
                    ))}
                  </div>
                )}
                {isToday && !isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Schedule */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-50">
            <Calendar className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-slate-800">{formatDate(selectedDate, 'EEEE, MMMM d')}</h2>
            <div className="text-xs text-slate-400 font-medium">{selectedBlocks.length} study block{selectedBlocks.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20" />)}</div>
        ) : selectedBlocks.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-50">
              <Calendar className="w-7 h-7 text-slate-300" />
            </div>
            <div className="text-sm font-semibold text-slate-500">No study blocks for this day</div>
            <div className="text-xs text-slate-400 mt-1">Generate a schedule to fill your week</div>
            <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="btn-primary mt-4 text-sm">
              <Sparkles className="w-4 h-4" /> Generate Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((block, i) => (
              <TimelineBlock key={block._id} block={block} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Schedule Warnings */}
      {generateMutation.data?.warnings?.length ? (
        <div className="card-accent p-5 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-brand-700 uppercase tracking-[0.06em]">Schedule Notes</span>
          </div>
          {generateMutation.data.warnings.map((w, i) => (
            <div key={i} className="text-sm text-slate-600 flex gap-2 py-1">
              <span className="text-amber-500 font-bold">!</span> {w}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
