import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getStoredToken, storeSession } from '../lib/session';
import type { EmployeeRole } from '../types/assetflow';

type AuthResponse = {
  employee: { id: string; name: string; email: string; role: EmployeeRole; status: string; departmentId: string | null };
  token: string;
};

type RecoveryResponse = { message: string; resetToken: string };

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup' | 'recover'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@assetflow.local');
  const [password, setPassword] = useState('Admin@12345');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (getStoredToken()) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const submitLabel = useMemo(() => {
    if (mode === 'signup') return 'Create employee account';
    if (mode === 'recover') return recoveryReady ? 'Update password' : 'Get recovery code';
    return 'Sign in to workspace';
  }, [mode, recoveryReady]);

  const switchMode = (nextMode: 'login' | 'signup' | 'recover') => {
    setMode(nextMode);
    setError('');
    setNotice('');
    setRecoveryReady(false);
    setRecoveryCode('');
    if (nextMode === 'signup') {
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      if (mode === 'recover') {
        if (!recoveryReady) {
          const result = await apiRequest<RecoveryResponse>('/api/auth/forgot-password', {
            method: 'POST', body: JSON.stringify({ email })
          });
          setRecoveryCode(result.resetToken);
          setRecoveryReady(true);
          setPassword('');
          setConfirmPassword('');
          setNotice('Recovery code created. Keep it private and choose a new password below.');
          return;
        }

        if (password !== confirmPassword) throw new Error('Your new passwords do not match.');
        await apiRequest<{ message: string }>('/api/auth/reset-password', {
          method: 'POST', body: JSON.stringify({ email, token: recoveryCode, password })
        });
        setNotice('Password updated. You can now sign in.');
        setPassword('');
        setConfirmPassword('');
        setMode('login');
        return;
      }

      const payload = mode === 'login' ? { email, password } : { name, email, password };
      const result = await apiRequest<AuthResponse>(mode === 'login' ? '/api/auth/login' : '/api/auth/signup', {
        method: 'POST', body: JSON.stringify(payload)
      });
      storeSession(result.token, result.employee);
      navigate('/dashboard', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mesh px-4 py-6 text-slate-100 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl place-items-center">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-ink-900/80 shadow-glow backdrop-blur lg:grid-cols-[1fr_0.9fr]">
          <div className="p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-aurora/25 bg-aurora/10 text-lg font-semibold text-aurora">A</div>
              <div><p className="text-xs uppercase tracking-[0.3em] text-aurora">AssetFlow</p><p className="mt-1 text-sm text-slate-400">Asset operations, in sync.</p></div>
            </div>
            <h1 className="mt-9 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {mode === 'recover' ? 'Recover your account' : 'A clearer view of every resource.'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              {mode === 'recover' ? 'Request a one-time recovery code, then set a new secure password.' : 'Track assets, availability, maintenance, and accountability from a single operating workspace.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-2 rounded-2xl bg-ink-800/70 p-1.5">
              <button type="button" onClick={() => switchMode('login')} className={`rounded-xl px-4 py-2 text-sm transition ${mode === 'login' ? 'bg-aurora/15 text-aurora' : 'text-slate-400 hover:text-white'}`}>Sign in</button>
              <button type="button" onClick={() => switchMode('signup')} className={`rounded-xl px-4 py-2 text-sm transition ${mode === 'signup' ? 'bg-aurora/15 text-aurora' : 'text-slate-400 hover:text-white'}`}>Create account</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'signup' && <label className="block"><span className="mb-2 block text-sm text-slate-300">Full name</span><input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-4 py-3 placeholder:text-slate-500" placeholder="Your name" /></label>}
              <label className="block"><span className="mb-2 block text-sm text-slate-300">Work email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-4 py-3 placeholder:text-slate-500" placeholder="name@company.com" /></label>
              {(mode !== 'recover' || recoveryReady) && <label className="block"><span className="mb-2 block text-sm text-slate-300">{mode === 'recover' ? 'New password' : 'Password'}</span><input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-4 py-3 placeholder:text-slate-500" placeholder="At least 8 characters" /></label>}
              {mode === 'recover' && recoveryReady && <><label className="block"><span className="mb-2 block text-sm text-slate-300">Recovery code</span><input required value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-4 py-3 font-mono text-sm placeholder:text-slate-500" /></label><label className="block"><span className="mb-2 block text-sm text-slate-300">Confirm new password</span><input required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-4 py-3" /></label></>}
              {error && <div role="alert" className="rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>}
              {notice && <div className="rounded-2xl border border-aurora/25 bg-aurora/10 px-4 py-3 text-sm text-aurora">{notice}</div>}
              <button disabled={loading} type="submit" className="w-full rounded-2xl border border-aurora/30 bg-aurora/15 px-4 py-3 font-medium text-aurora transition hover:bg-aurora/20 disabled:opacity-60">{loading ? 'Please wait…' : submitLabel}</button>
              {mode === 'login' && <button type="button" onClick={() => switchMode('recover')} className="w-full text-sm text-slate-400 transition hover:text-aurora">Forgot password?</button>}
              {mode === 'recover' && <button type="button" onClick={() => switchMode('login')} className="w-full text-sm text-slate-400 transition hover:text-aurora">Back to sign in</button>}
            </form>
          </div>

          <aside className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-aurora/10 via-ink-800/80 to-ember/10 p-6 sm:p-10 lg:border-l lg:border-t-0">
            <div className="absolute -right-16 top-6 h-44 w-44 rounded-full bg-aurora/15 blur-3xl" /><div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-ember/15 blur-3xl" />
            <div className="relative"><p className="text-xs uppercase tracking-[0.28em] text-aurora">Built for the day-to-day</p><h2 className="mt-3 text-2xl font-semibold text-white">Decisions with context.</h2><div className="mt-8 space-y-3">{[['Live availability', 'See what is ready, allocated, or in maintenance.'], ['Conflict-safe bookings', 'Avoid overlapping reservations before they happen.'], ['Traceable operations', 'Keep approvals, returns, and audits easy to follow.']].map(([title, detail], index) => <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-ink-900/50 p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm text-aurora">0{index + 1}</span><div><h3 className="font-medium text-white">{title}</h3><p className="mt-1 text-sm leading-5 text-slate-400">{detail}</p></div></div>)}</div><div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/50 p-4 text-sm text-slate-300"><span className="font-medium text-white">Default administrator</span><br />admin@assetflow.local · Password set in your environment</div></div>
          </aside>
        </section>
      </div>
    </main>
  );
}
