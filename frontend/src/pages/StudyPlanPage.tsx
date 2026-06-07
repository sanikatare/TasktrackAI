import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, BookOpen, Clock, Target, ChevronDown, ChevronUp, Loader2, RefreshCw, Lightbulb, GraduationCap } from 'lucide-react';
import apiClient from '@/utils/apiClient';
import { useTasks } from '@/hooks/useTasks';
import type { AIStudyPlan, Task } from '@/types';
import { PRIORITY_CONFIG } from '@/config/constants';
import { deadlineLabel, formatDate } from '@/utils/dateUtils';
import clsx from 'clsx';

function PlanSection({ section, index, total }: { section: AIStudyPlan['breakdown'][0]; index: number; total: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="card overflow-hidden transition-all duration-300">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm">
              {index + 1}
            </div>
            {index < total - 1 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-2 bg-brand-200" />
            )}
          </div>
          <span className="text-sm font-semibold text-slate-800">{section.title}</span>
          <span className="badge badge-blue text-[10px]">{section.duration}</span>
        </div>
        <div className={clsx(
          'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200',
          open ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'
        )}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100/80 animate-fade-in">
          {section.topics.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] mb-2">Topics</div>
              <div className="flex flex-wrap gap-1.5">
                {section.topics.map((t, i) => <span key={i} className="badge badge-blue text-[10px]">{t}</span>)}
              </div>
            </div>
          )}
          {section.activities.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] mb-2">Activities</div>
              <ul className="space-y-2">
                {section.activities.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskSelectCard({ task, selected, onSelect }: { task: Task; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className={clsx(
        'w-full text-left p-4 rounded-xl border-2 transition-all duration-300',
        selected
          ? 'border-brand-400 bg-brand-50/60 shadow-glow-sm'
          : 'border-transparent card hover:border-brand-200/50'
      )}>
      <div className="flex items-start gap-3">
        <div className={clsx(
          'mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
          selected ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
        )}>
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800 truncate">{task.title}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-slate-400 font-medium">{task.subject}</span>
            <span className={clsx('badge text-[10px]', PRIORITY_CONFIG[task.priority].bg)}>
              {PRIORITY_CONFIG[task.priority].label}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">{deadlineLabel(task.deadline)}</div>
        </div>
      </div>
    </button>
  );
}

export default function StudyPlanPage() {
  const { tasks } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  const { data: existingPlan, isLoading: planLoading } = useQuery<AIStudyPlan | null>({
    queryKey: ['study-plan', selectedTaskId],
    queryFn: async () => {
      if (!selectedTaskId) return null;
      try {
        const { data } = await apiClient.get(`/ai/plan/${selectedTaskId}`);
        return data.data;
      } catch { return null; }
    },
    enabled: !!selectedTaskId,
  });

  const generatePlanMutation = useMutation({
    mutationFn: async (taskId: string) => (await apiClient.post<{ data: AIStudyPlan }>('/ai/generate-plan', { taskId })).data.data,
  });

  const plan = generatePlanMutation.data ?? existingPlan;
  const isGenerating = generatePlanMutation.isPending;

  return (
    <div className="page-shell">
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          AI Study Plan
        </h1>
        <p className="page-subtitle">Select a task to generate a personalized study plan with Claude AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Task Selector */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.06em]">Select Task</span>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="card p-6 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-slate-50">
                <BookOpen className="w-6 h-6 text-slate-300" />
              </div>
              <div className="text-sm font-medium text-slate-400">No pending tasks</div>
              <div className="text-xs text-slate-300 mt-1">Create tasks first to generate study plans</div>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <TaskSelectCard key={task._id} task={task} selected={selectedTaskId === task._id}
                  onSelect={() => setSelectedTaskId(task._id)} />
              ))}
            </div>
          )}
          {selectedTaskId && (
            <button onClick={() => generatePlanMutation.mutate(selectedTaskId)} disabled={isGenerating}
              className="btn-primary w-full justify-center mt-3 py-3">
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate with Claude AI</>
              )}
            </button>
          )}
        </div>

        {/* Plan Display */}
        <div className="lg:col-span-3">
          {!selectedTaskId ? (
            <div className="empty-state py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100/60">
                <GraduationCap className="w-8 h-8 text-brand-400" />
              </div>
              <div className="text-base font-bold text-slate-600">Select a task to begin</div>
              <div className="text-sm text-slate-400 mt-1 max-w-xs">Choose a pending task and let Claude AI build your personalized study plan</div>
            </div>
          ) : planLoading || isGenerating ? (
            <div className="card flex flex-col items-center justify-center py-20">
              <div className="relative mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-50">
                  <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-2xl animate-ping bg-brand-100/30" />
              </div>
              <div className="text-sm font-semibold text-slate-600">{isGenerating ? 'Claude is generating your plan...' : 'Loading plan...'}</div>
              <div className="text-xs text-slate-400 mt-1">This may take a few seconds</div>
            </div>
          ) : plan ? (
            <div className="space-y-5 animate-fade-up">
              {/* Plan Overview */}
              <div className="card-accent p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-100/80">
                      <Lightbulb className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <span className="text-xs font-bold text-brand-700 uppercase tracking-[0.06em]">AI Generated Plan</span>
                  </div>
                  <button onClick={() => generatePlanMutation.mutate(selectedTaskId)} className="btn-ghost text-xs px-3 py-1.5">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{plan.planText}</p>
                <div className="flex gap-4 mt-4 pt-4 border-t border-brand-100/60 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{plan.estimatedDays} days</div>
                  <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{plan.breakdown.length} sections</div>
                  <div className="ml-auto">Generated {formatDate(plan.generatedAt)}</div>
                </div>
              </div>

              {/* Daily Goals */}
              {plan.dailyGoals.length > 0 && (
                <div className="card p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Daily Goals</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.dailyGoals.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className="text-brand-600 font-bold text-xs mt-0.5 bg-brand-50 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Study Breakdown */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.06em]">Study Breakdown</span>
                </div>
                <div className="space-y-2">
                  {plan.breakdown.map((section, i) => (
                    <PlanSection key={i} section={section} index={i} total={plan.breakdown.length} />
                  ))}
                </div>
              </div>

              {/* Resources */}
              {plan.resources.length > 0 && (
                <div className="card p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Recommended Resources</h3>
                  </div>
                  <ul className="space-y-2">
                    {plan.resources.map((r, i) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state py-20">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-50">
                <Sparkles className="w-7 h-7 text-slate-300" />
              </div>
              <div className="text-sm font-semibold text-slate-500">No plan yet</div>
              <div className="text-xs text-slate-400 mt-1">Click &quot;Generate with Claude AI&quot; to create one</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
