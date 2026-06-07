import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  LogOut, Bell, Menu, X, Sparkles, GraduationCap, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard',    icon: LayoutDashboard, description: 'Overview & insights' },
  { to: '/tasks',     label: 'Tasks',        icon: CheckSquare,     description: 'Manage your work' },
  { to: '/schedule',  label: 'Schedule',     icon: Calendar,        description: 'AI-optimized plan' },
  { to: '/analytics', label: 'Analytics',    icon: BarChart3,       description: 'Track progress' },
  { to: '/plan',      label: 'AI Study Plan',icon: Sparkles,        description: 'Claude AI plans' },
] as const;

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/schedule': 'Schedule',
  '/analytics': 'Analytics',
  '/plan': 'AI Study Plan',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'StudyAI';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-page">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-[272px] flex flex-col bg-white border-r border-slate-200/60 transition-transform duration-300 ease-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ boxShadow: '4px 0 24px rgba(15,23,42,0.03)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100/80">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-800 shadow-glow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-slate-900 leading-none tracking-tight">StudyAI</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Smart Scheduler</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">Menu</span>
          </div>
          {NAV_ITEMS.map(({ to, label, icon: Icon, description }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                  isActive
                    ? 'text-brand-700 bg-gradient-to-r from-brand-50/90 to-brand-50/40 shadow-sm border border-brand-100/60'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/80'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0',
                  isActive
                    ? 'bg-brand-100/80 text-brand-600'
                    : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-500'
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="leading-tight">{label}</div>
                  <div className={clsx(
                    'text-[11px] leading-tight mt-0.5 transition-colors',
                    isActive ? 'text-brand-500/70' : 'text-slate-400'
                  )}>{description}</div>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Action */}
        <div className="px-3 pb-2">
          <button
            onClick={() => navigate('/plan')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-white/15 backdrop-blur">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="relative flex-1 text-left">
              <div className="text-white text-sm font-semibold leading-tight">Generate AI Plan</div>
              <div className="text-blue-200 text-[11px] mt-0.5">Powered by Claude</div>
            </div>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-slate-100/80">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-50/50 border border-slate-100/80 mb-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-brand-500 to-brand-700 ring-2 ring-brand-100">
                {user?.displayName?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800 truncate leading-tight">{user?.displayName}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-600 hover:bg-red-50/80 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-5 sm:px-6 py-3.5 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 hidden sm:block tracking-tight">{pageTitle}</h1>
          </div>

          {/* Search placeholder */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/60 text-sm text-slate-400 w-64 cursor-pointer hover:border-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span className="text-xs">Search...</span>
            <kbd className="ml-auto text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
          </div>

          <button className="relative p-2.5 rounded-xl border border-slate-200/80 text-slate-400 hover:bg-slate-50 hover:text-brand-600 hover:border-brand-200 transition-all duration-200">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
