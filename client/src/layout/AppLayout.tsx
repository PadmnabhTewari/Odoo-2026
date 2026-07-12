import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { sidebarItems } from '../data/assetflow';
import { apiRequest } from '../lib/api';
import { clearSession, getStoredEmployee } from '../lib/session';

export function AppLayout() {
  const navigate = useNavigate();
  const employee = getStoredEmployee();
  const visibleItems = sidebarItems.filter((item) => item.allowedRoles.includes(employee?.role ?? 'EMPLOYEE'));

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Clear the local session even if the server session is already gone.
    }

    clearSession();
    navigate('/', { replace: true });
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
      <aside className="rounded-[28px] border border-white/10 bg-ink-900/80 p-4 shadow-glow backdrop-blur">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-aurora">AssetFlow</p>
          <h1 className="mt-2 text-xl font-semibold text-white">Enterprise Asset ERP</h1>
          <p className="mt-2 text-sm text-slate-400">Structured around assets, bookings, maintenance, audits, and notifications.</p>
          {employee && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-ink-800/80 px-3 py-2 text-sm text-slate-300">
              <div className="font-medium text-white">{employee.name}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-aurora">{employee.role.replaceAll('_', ' ')}</div>
            </div>
          )}
        </div>

        <nav className="mt-4 space-y-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                [
                  'block rounded-2xl border px-4 py-3 transition',
                  isActive ? 'border-aurora/40 bg-aurora/10' : 'border-white/8 bg-white/3 hover:bg-white/6'
                ].join(' ')
              }
            >
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className="text-xs text-slate-400">{item.caption}</div>
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="mt-4 w-full rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember transition hover:bg-ember/20">
          Logout
        </button>
      </aside>

      <section className="space-y-4">
        <Outlet />
      </section>
    </div>
  );
}
