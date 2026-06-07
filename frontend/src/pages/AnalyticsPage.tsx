import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import apiClient from '@/utils/apiClient';
import type { Analytics } from '@/types';
import { DAYS_OF_WEEK } from '@/config/constants';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#64748b',
        font: { family: '"Inter"', size: 11, weight: '500' as const },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      titleColor: '#0f172a',
      bodyColor: '#475569',
      titleFont: { family: '"Inter"', weight: '600' as const, size: 12 },
      bodyFont: { family: '"Inter"', size: 12 },
      padding: 12,
      boxPadding: 6,
      cornerRadius: 10,
      displayColors: true,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8', font: { family: '"Inter"', size: 11 } },
      grid: { color: '#f1f5f9', drawBorder: false },
      border: { display: false },
    },
    y: {
      ticks: { color: '#94a3b8', font: { family: '"Inter"', size: 11 } },
      grid: { color: '#f1f5f9', drawBorder: false },
      border: { display: false },
    },
  },
};

function StatRing({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const circumference = 2 * Math.PI * 32;

  return (
    <div className="card p-5 flex flex-col items-center">
      <div className="relative w-20 h-20 mb-3">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="32" fill="none" stroke="#f1f5f9" strokeWidth="5" />
          <circle cx="36" cy="36" r="32" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
            strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-extrabold text-slate-900 tracking-tight">{value.toFixed(0)}</span>
        </div>
      </div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => (await apiClient.get('/analytics')).data.data,
  });

  if (isLoading) {
    return (
      <div className="page-shell space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-72" />)}
        </div>
      </div>
    );
  }

  const weekLabels = (analytics?.weeklyProgress ?? []).map(w => DAYS_OF_WEEK[new Date(w.date).getDay()]);

  const weeklyChartData = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Completed',
        data: (analytics?.weeklyProgress ?? []).map(w => w.completed),
        backgroundColor: 'rgba(37,99,235,0.85)',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Planned',
        data: (analytics?.weeklyProgress ?? []).map(w => w.planned),
        backgroundColor: 'rgba(203,213,225,0.4)',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const studyHoursData = {
    labels: weekLabels,
    datasets: [{
      label: 'Study Hours',
      data: (analytics?.weeklyProgress ?? []).map(w => w.studyHours),
      fill: true,
      backgroundColor: (ctx: any) => {
        const gradient = ctx.chart?.ctx?.createLinearGradient(0, 0, 0, 200);
        if (gradient) {
          gradient.addColorStop(0, 'rgba(37,99,235,0.2)');
          gradient.addColorStop(1, 'rgba(37,99,235,0.01)');
        }
        return gradient || 'rgba(37,99,235,0.15)';
      },
      borderColor: '#2563eb',
      borderWidth: 2.5,
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#2563eb',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const subjectLabels = Object.keys(analytics?.tasksBySubject ?? {});
  const subjectColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const doughnutData = {
    labels: subjectLabels,
    datasets: [{
      data: Object.values(analytics?.tasksBySubject ?? {}),
      backgroundColor: subjectColors.slice(0, subjectLabels.length),
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverBorderWidth: 0,
      spacing: 2,
    }],
  };

  const completionRate = analytics?.completionRate ?? 0;

  return (
    <div className="page-shell space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Track your progress and study performance</p>
      </div>

      {/* Top Stats with Rings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatRing value={completionRate} max={100} label="Completion" color="#2563eb" />
        <StatRing value={analytics?.totalStudyHours ?? 0} max={Math.max(analytics?.totalStudyHours ?? 1, 40)} label="Study Hours" color="#3b82f6" />
        <StatRing value={analytics?.avgProductivityScore ?? 0} max={10} label="Productivity" color="#10b981" />
        <StatRing value={analytics?.streakDays ?? 0} max={Math.max(analytics?.streakDays ?? 1, 30)} label="Day Streak" color="#f59e0b" />
      </div>

      {/* Quick Stats Bar */}
      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Tasks', value: analytics?.totalTasks ?? 0, icon: Target, color: 'text-brand-600', bg: 'bg-brand-50' },
            { label: 'Completed', value: analytics?.completedTasks ?? 0, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending', value: analytics?.pendingTasks ?? 0, icon: TrendingUp, color: 'text-slate-500', bg: 'bg-slate-50' },
            { label: 'Skipped', value: analytics?.skippedTasks ?? 0, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900 leading-none">{value}</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completions */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Weekly Completions</h3>
              <div className="text-xs text-slate-400 mt-0.5">Tasks completed vs planned</div>
            </div>
          </div>
          <div className="h-56">
            <Bar data={weeklyChartData} options={{
              ...CHART_DEFAULTS,
              scales: {
                ...CHART_DEFAULTS.scales,
                x: { ...CHART_DEFAULTS.scales.x, stacked: false },
                y: { ...CHART_DEFAULTS.scales.y, beginAtZero: true, ticks: { ...CHART_DEFAULTS.scales.y.ticks, stepSize: 1 } },
              },
            } as never} />
          </div>
        </div>

        {/* Study Hours */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daily Study Hours</h3>
              <div className="text-xs text-slate-400 mt-0.5">Hours logged per day</div>
            </div>
          </div>
          <div className="h-56">
            <Line data={studyHoursData} options={{
              ...CHART_DEFAULTS,
              plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
              scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, beginAtZero: true } },
            } as never} />
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tasks by Subject</h3>
              <div className="text-xs text-slate-400 mt-0.5">Distribution across subjects</div>
            </div>
          </div>
          {subjectLabels.length > 0 ? (
            <div className="h-56 flex items-center justify-center">
              <Doughnut data={doughnutData} options={{
                ...CHART_DEFAULTS,
                scales: undefined,
                cutout: '65%',
                plugins: {
                  ...CHART_DEFAULTS.plugins,
                  legend: {
                    position: 'right' as const,
                    labels: {
                      ...CHART_DEFAULTS.plugins.legend.labels,
                      padding: 12,
                    },
                  },
                },
              } as never} />
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-slate-50">
                <Target className="w-6 h-6 text-slate-300" />
              </div>
              <div className="text-sm text-slate-400 font-medium">No task data yet</div>
            </div>
          )}
        </div>

        {/* Task Status Breakdown */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Status Breakdown</h3>
              <div className="text-xs text-slate-400 mt-0.5">Task completion overview</div>
            </div>
          </div>
          <div className="space-y-5 mt-2">
            {[
              { label: 'Completed', value: analytics?.completedTasks ?? 0, color: '#10b981', bg: 'bg-emerald-50' },
              { label: 'Pending', value: analytics?.pendingTasks ?? 0, color: '#2563eb', bg: 'bg-brand-50' },
              { label: 'Skipped', value: analytics?.skippedTasks ?? 0, color: '#f59e0b', bg: 'bg-amber-50' },
            ].map(item => {
              const total = analytics?.totalTasks ?? 1;
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full`} style={{ background: item.color }} />
                      <span className="text-sm font-medium text-slate-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{item.value}</span>
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ color: item.color, background: `${item.color}12` }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar h-2">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
