import { useState } from 'react';
import { Plus, Search, Check, Trash2, Clock, Calendar, Filter } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import Modal from '@/components/ui/Modal';
import type { Task, CreateTaskForm, Priority, SubjectCategory, TaskStatus } from '@/types';
import { PRIORITY_CONFIG, STATUS_CONFIG, CATEGORY_CONFIG, DIFFICULTY_LABELS } from '@/config/constants';
import { deadlineLabel, deadlineUrgency, hoursToReadable } from '@/utils/dateUtils';
import clsx from 'clsx';

function TaskForm({ initial, onSubmit, onClose }:
  { initial?: Partial<CreateTaskForm>; onSubmit: (f: CreateTaskForm) => void; onClose: () => void }) {
  const [form, setForm] = useState<CreateTaskForm>({
    title: initial?.title ?? '', subject: initial?.subject ?? '', category: initial?.category ?? 'theory',
    description: initial?.description ?? '', deadline: initial?.deadline ?? '',
    estimatedHours: initial?.estimatedHours ?? 2, priority: initial?.priority ?? 'medium',
    difficulty: initial?.difficulty ?? 3, tags: initial?.tags ?? [],
  });

  function update<K extends keyof CreateTaskForm>(k: K, v: CreateTaskForm[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Task Title</label>
          <input className="input" value={form.title} onChange={e => update('title', e.target.value)}
            placeholder="e.g. Data Structures Assignment" required />
        </div>
        <div>
          <label className="label">Subject</label>
          <input className="input" value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="e.g. DSA" required />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={e => update('category', e.target.value as SubjectCategory)}>
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Deadline</label>
          <input type="date" className="input" value={form.deadline} onChange={e => update('deadline', e.target.value)} required />
        </div>
        <div>
          <label className="label">Estimated Hours</label>
          <input type="number" className="input" value={form.estimatedHours}
            onChange={e => update('estimatedHours', Number(e.target.value))} min={0.5} step={0.5} />
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={e => update('priority', e.target.value as Priority)}>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Difficulty (1–5)</label>
          <select className="input" value={form.difficulty}
            onChange={e => update('difficulty', Number(e.target.value) as 1|2|3|4|5)}>
            {[1,2,3,4,5].map(d => <option key={d} value={d}>{d} — {DIFFICULTY_LABELS[d]}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Description (optional)</label>
          <textarea className="input resize-none h-20" value={form.description}
            onChange={e => update('description', e.target.value)} placeholder="Additional notes..." />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button className="btn-ghost flex-1" onClick={onClose} type="button">Cancel</button>
        <button className="btn-primary flex-1" onClick={() => onSubmit(form)} type="button">Save Task</button>
      </div>
    </div>
  );
}

function TaskCard({ task, onComplete, onDelete }:
  { task: Task; onComplete: () => void; onDelete: () => void }) {
  const urgency = deadlineUrgency(task.deadline);
  const isCompleted = task.status === 'completed';
  const urgencyColors = {
    critical: 'bg-red-500',
    warning: 'bg-amber-400',
    safe: 'bg-brand-400',
  };

  return (
    <div className={clsx(
      'card p-4 sm:p-5 group transition-all duration-300 hover:border-brand-200/50 relative overflow-hidden',
      isCompleted && 'opacity-60'
    )}>
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Completion indicator */}
        <div className="relative shrink-0">
          <button onClick={onComplete} disabled={isCompleted}
            className={clsx(
              'mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
              isCompleted
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                : 'border-slate-300 hover:border-brand-500 hover:bg-brand-50'
            )}>
            {isCompleted && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className={clsx('text-sm font-semibold text-slate-800', isCompleted && 'line-through text-slate-500')}>
              {task.title}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="badge text-[10px]" style={{
                color: STATUS_CONFIG[task.status].color,
                borderColor: `${STATUS_CONFIG[task.status].color}30`,
                background: `${STATUS_CONFIG[task.status].color}10`
              }}>
                {STATUS_CONFIG[task.status].label}
              </span>
              <button onClick={onDelete}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={clsx('badge text-[10px]', PRIORITY_CONFIG[task.priority].bg)}>
              {PRIORITY_CONFIG[task.priority].label}
            </span>
            <span className="badge badge-blue text-[10px]">{CATEGORY_CONFIG[task.category]?.label}</span>
            <span className="text-[11px] text-slate-400 font-medium">{task.subject}</span>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span className={clsx({
                'text-red-600 font-semibold': urgency === 'critical',
                'text-amber-600 font-medium': urgency === 'warning'
              })}>
                {deadlineLabel(task.deadline)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{hoursToReadable(task.estimatedHours)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgency indicator bar */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl', urgencyColors[urgency])}
        style={{ opacity: isCompleted ? 0.3 : 0.8 }} />
    </div>
  );
}

export default function TasksPage() {
  const { tasks, isLoading, createTask, completeTask, deleteTask } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const activeCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{activeCount} active task{activeCount !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto py-2.5" value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')}>
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="input w-auto py-2.5" value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | 'all')}>
          <option value="all">All Priority</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-50">
            <Filter className="w-7 h-7 text-slate-300" />
          </div>
          <div className="text-base font-semibold text-slate-600">No tasks found</div>
          <div className="text-sm text-slate-400 mt-1 max-w-xs">
            {search ? 'Try adjusting your search or filters' : 'Add your first task to get started with your study plan'}
          </div>
          {!search && (
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 text-sm">
              <Plus className="w-4 h-4" /> Add Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <TaskCard key={task._id} task={task} onComplete={() => completeTask(task._id)} onDelete={() => deleteTask(task._id)} />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Task">
        <TaskForm onSubmit={async f => { await createTask(f); setShowCreate(false); }} onClose={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
