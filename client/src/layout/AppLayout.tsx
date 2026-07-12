import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { sidebarItems } from '../data/assetflow';
import { apiRequest } from '../lib/api';
import { clearSession, getStoredEmployee } from '../lib/session';

const navigationIcons: Record<string, string> = {
  dashboard: '⌘',
  organization: '◎',
  assets: '▣',
  allocations: '⇄',
  bookings: '◷',
  maintenance: '◈',
  audits: '✓',
  reports: '↗',
  activity: '◌'
};

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
    <div className="mx-auto grid min-h-screen max-w-[1680px] gap-4 px-3 py-3 sm:px-5 sm:py-5 lg:grid-cols-[292px_minmax(0,1fr)] lg:px-7">
      <aside className="rounded-[28px] border border-white/10 bg-ink-900/80 p-3 shadow-glow backdrop-blur lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
        <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-5">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-aurora/15 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-aurora/25 bg-aurora/10 text-lg font-semibold text-aurora">A</div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-aurora">AssetFlow</p>
              <h1 className="mt-1 text-lg font-semibold text-white">Operations hub</h1>
            </div>
          </div>
          <p className="relative mt-4 text-sm leading-6 text-slate-400">Manage assets, availability, and accountability from one workspace.</p>
          {employee && (
            <div className="relative mt-5 flex items-center gap-3 border-t border-white/10 pt-4 text-sm text-slate-300">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aurora/30 to-sky-400/25 text-sm font-semibold text-aurora">
                {employee.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium text-white">{employee.name}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-aurora">{employee.role.replace(/_/g, ' ')}</div>
              </div>
            </div>
          )}
        </div>

        <nav aria-label="Primary navigation" className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
          {visibleItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                [
                  'group flex min-w-[168px] items-center gap-3 rounded-2xl border px-3 py-3 transition duration-200 lg:min-w-0',
                  isActive ? 'border-aurora/35 bg-aurora/10 shadow-[inset_0_0_20px_rgba(71,215,172,0.06)]' : 'border-transparent hover:border-white/10 hover:bg-white/[0.045]'
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base transition ${isActive ? 'border-aurora/30 bg-aurora/15 text-aurora' : 'border-white/10 bg-white/[0.035] text-slate-400 group-hover:text-slate-200'}`}>
                    {navigationIcons[item.id]}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm font-medium ${isActive ? 'text-white' : 'text-slate-200'}`}>{item.label}</span>
                    <span className="block truncate text-xs text-slate-500">{item.caption}</span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-300 transition hover:border-ember/30 hover:bg-ember/10 hover:text-ember">
          <span aria-hidden="true">↪</span> Sign out
        </button>
      </aside>

      <section className="min-w-0 space-y-4 pb-4">
        <Outlet />
      </section>
    </div>
  );
}
