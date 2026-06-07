import { GraduationCap } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-50/50 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-50/40 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-800 animate-pulse-slow"
            style={{ boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)' }}>
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-brand-200/50 animate-ping" />
        </div>

        <div className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">StudyAI</div>
        <div className="text-sm text-slate-400 font-medium mb-8">Loading your workspace...</div>

        {/* Premium dots loader */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
