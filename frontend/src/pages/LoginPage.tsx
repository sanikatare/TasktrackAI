import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Chrome, Sparkles, BookOpen, Calendar, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle, loginWithDev, devAuthEnabled, firebaseConfigured, useMongoAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch {/* handled in hook */}
  }

  async function handleDevLogin() {
    try {
      await loginWithDev();
      navigate('/');
    } catch {/* handled in hook */}
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
            Study smarter,<br />not harder.
          </h1>
          <p className="text-blue-100/70 text-lg max-w-md leading-relaxed font-medium">
            AI-powered scheduling, task optimization, and personalized study plans — all in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: Sparkles, label: 'AI-Powered Plans', desc: 'Claude AI generates personalized study plans' },
            { icon: Calendar, label: 'Smart Scheduling', desc: 'Optimized timelines based on your priorities' },
            { icon: BookOpen, label: 'Track Progress', desc: 'Beautiful analytics and streak tracking' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/10 transition-all hover:bg-white/[0.12]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 shrink-0">
                <Icon className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs text-blue-200/60 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-3 bg-gradient-to-br from-brand-500 to-brand-800 shadow-glow">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">StudyAI</h1>
          </div>

          <div className="card p-8 border-slate-200/60" style={{ boxShadow: '0 4px 24px rgba(37, 99, 235, 0.06), 0 1px 3px rgba(15,23,42,0.04)' }}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-400 mb-6 font-medium">Sign in to continue to your workspace</p>

            {useMongoAuth && !firebaseConfigured && (
              <div className="alert-success mb-5 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3 text-emerald-600" />
                </div>
                <span>Email &amp; password login — stored securely in MongoDB.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu" className="input pl-10" required />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" className="input pl-10" required />
                </div>
              </div>
              <button type="submit" disabled={loading || (!firebaseConfigured && !useMongoAuth)}
                className="btn-primary w-full py-3 mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75"/></svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="divider-line" />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-white text-xs text-slate-400 font-medium">or</span>
            </div>

            <button onClick={handleGoogle} disabled={!firebaseConfigured}
              className="btn-ghost w-full disabled:opacity-40">
              <Chrome className="w-4 h-4" /> Continue with Google
            </button>

            {devAuthEnabled && (
              <button onClick={handleDevLogin} type="button" className="btn-secondary w-full mt-3">
                <Zap className="w-4 h-4" /> Quick Dev Login
              </button>
            )}

            <p className="text-center text-sm text-slate-400 mt-6 font-medium">
              New here?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1">
                Create an account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
