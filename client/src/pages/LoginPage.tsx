import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';

type AuthResponse = {
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  token: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@assetflow.local');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('assetflow_token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const submitLabel = useMemo(() => (mode === 'login' ? 'Login' : 'Create Employee Account'), [mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = mode === 'login' ? { email, password } : { name, email, password };
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const result = await apiRequest<AuthResponse>(path, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      localStorage.setItem('assetflow_token', result.token);
      localStorage.setItem('assetflow_employee', JSON.stringify(result.employee));
      navigate('/dashboard', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mesh px-4 py-10 text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl place-items-center">
        <section className="grid w-full gap-8 rounded-[32px] border border-white/10 bg-ink-900/80 p-6 shadow-glow backdrop-blur lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.32em] text-aurora">AssetFlow login</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Access the organization workspace</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Real accounts only. Employees sign up first, and admin promotion happens inside the organization directory.
            </p>

            <div className="mt-8 flex gap-2">
              <button onClick={() => setMode('login')} className={`rounded-full px-4 py-2 text-sm ${mode === 'login' ? 'bg-aurora/20 text-aurora' : 'bg-ink-800/80 text-slate-300'}`}>
                Login
              </button>
              <button onClick={() => setMode('signup')} className={`rounded-full px-4 py-2 text-sm ${mode === 'signup' ? 'bg-aurora/20 text-aurora' : 'bg-ink-800/80 text-slate-300'}`}>
                Signup
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Name</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500" placeholder="Your name" />
                </label>
              )}
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500" placeholder="name@company.com" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500" placeholder="••••••••" />
              </label>
              {error && <div className="rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>}
              <button disabled={loading} type="submit" className="w-full rounded-full border border-aurora/30 bg-aurora/10 px-4 py-3 text-aurora disabled:opacity-60">
                {loading ? 'Please wait...' : submitLabel}
              </button>
              <button type="button" className="w-full text-sm text-slate-400 hover:text-white">
                Forgot password
              </button>
            </form>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="grid h-full gap-4 content-start">
              <div className="rounded-3xl border border-white/10 bg-ink-800/80 p-6">
                <h2 className="text-xl font-semibold text-white">Signup policy</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  New users create Employee accounts only. No self-assigned admin roles. Admins promote Department Heads and Asset Managers from the employee directory.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-ink-800/80 p-6">
                <h2 className="text-xl font-semibold text-white">Default admin</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Use admin@assetflow.local with password Admin@12345 after the database is seeded for the first time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
