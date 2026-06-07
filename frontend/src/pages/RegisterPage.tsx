import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', studyHoursPerDay: 6 });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWithEmail(form.email, form.password, form.displayName, form.studyHoursPerDay);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* Left Panel - Branding */}
      <div className="auth-panel">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">StudyAI</span>
              <div className="text-[11px] text-blue-200/60 font-medium tracking-wide">SMART SCHEDULER</div>
            </div>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.1] mb-5 text-white tracking-tight">
            Start your<br />journey today.
          </h1>
          <p className="text-blue-100/70 text-lg max-w-md leading-relaxed font-medium">
            Create your account and let AI help you build the perfect study routine.
          </p>
        </div>

        <ul className="relative z-10 space-y-3">
          {[
            { text: 'Personalized AI study plans tailored to your needs' },
            { text: 'Smart deadline tracking with reminders' },
            { text: 'Beautiful analytics and weekly progress reports' },
            { text: 'Google Calendar integration for seamless scheduling' },
          ].map(({ text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-blue-100/80">
              <CheckCircle2 className="w-4.5 h-4.5 text-blue-300/80 shrink-0" />
              <span className="font-medium">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8 border-slate-200/60" style={{ boxShadow: '0 4px 24px rgba(37, 99, 235, 0.06), 0 1px 3px rgba(15,23,42,0.04)' }}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">Create account</h2>
            <p className="text-sm text-slate-400 mb-6 font-medium">Set up your study workspace in seconds</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={form.displayName} onChange={e => update('displayName', e.target.value)}
                    placeholder="Your name" className="input pl-10" required />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="you@university.edu" className="input pl-10" required />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                    placeholder="Min. 6 characters" className="input pl-10" minLength={6} required />
                </div>
              </div>
              <div>
                <label className="label">Daily Study Hours</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" value={form.studyHoursPerDay}
                    onChange={e => update('studyHoursPerDay', Number(e.target.value))}
                    min={1} max={16} className="input pl-10" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75"/></svg>
                    Creating account...
                  </span>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1">
                Sign in <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
