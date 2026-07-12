import { useEffect, useState } from 'react';
import { PageHero } from '../components/PageHero';
import { InfoCard } from '../components/InfoCard';
import { KpiCard } from '../components/KpiCard';
import { apiRequest } from '../lib/api';
import { getStoredEmployee } from '../lib/session';
import { alerts as fallbackAlerts, activity as fallbackActivity, workflow } from '../data/assetflow';

type OverviewResponse = {
  employee: { name: string; role: string; departmentId: string | null };
  kpis: { label: string; value: number; delta: string }[];
  alerts: string[];
  activities: { action: string; subject: string; at: string }[];
};

export function DashboardPage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState('');
  const currentEmployee = getStoredEmployee();

  useEffect(() => {
    apiRequest<OverviewResponse>('/api/overview')
      .then(setOverview)
      .catch((caughtError) => setError(caughtError instanceof Error ? caughtError.message : 'Failed to load dashboard.'));
  }, []);

  const kpis = overview?.kpis ?? [
    { label: 'Assets Available', value: 214, delta: '+12' },
    { label: 'Assets Allocated', value: 86, delta: '+3' },
    { label: 'Maintenance Today', value: 7, delta: '2 pending approval' },
    { label: 'Active Bookings', value: 19, delta: '4 starting soon' }
  ];

  const alerts = overview?.alerts ?? fallbackAlerts;
  const activity = overview?.activities ?? fallbackActivity;

  return (
    <>
      <PageHero
        title="Enterprise Asset & Resource Management"
        subtitle="Centralized ERP-style workflows for departments, assets, bookings, maintenance, audits, notifications, and accountability."
        badge={overview ? `${overview.employee.name} • ${overview.employee.role}` : currentEmployee ? `${currentEmployee.name} • ${currentEmployee.role}` : 'Dashboard'}
      />

      {error && <div className="rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <KpiCard key={item.label} label={item.label} value={String(item.value)} delta={item.delta} tone="aurora" />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <article className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Operational snapshot</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">What the team manages every day</h3>
            </div>
            <div className="rounded-full border border-aurora/30 bg-aurora/10 px-3 py-1 text-xs text-aurora">
              Live workflow map
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h4 className="text-sm font-medium text-white">Dashboard alerts</h4>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                {alerts.map((alert) => (
                  <div key={alert} className="rounded-xl border border-white/8 bg-ink-800/60 px-4 py-3">{alert}</div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h4 className="text-sm font-medium text-white">Core workflow</h4>
              <ol className="mt-3 space-y-3 text-sm text-slate-300">
                {workflow.map((step, index) => (
                  <li key={step} className="flex gap-3 rounded-xl border border-white/8 bg-ink-800/60 px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember/20 text-xs font-semibold text-ember">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </article>

        <aside className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
          <h3 className="text-2xl font-semibold text-white">Screen coverage</h3>
          <p className="mt-2 text-sm text-slate-400">Each section from the mockup now has a dedicated page and reusable content model.</p>
          <div className="mt-4 grid gap-3">
            {activity.slice(0, 3).map((card) => (
              <InfoCard key={card.subject} title={card.action} description={card.subject} status={card.at} />
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
