import type { ReactNode } from 'react';
import type { ScreenId } from '../types/assetflow';
import { sidebarItems } from '../data/assetflow';

export function Shell({ activeScreen, children }: { activeScreen: ScreenId; children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
      <aside className="rounded-[28px] border border-white/10 bg-ink-900/80 p-4 shadow-glow backdrop-blur">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-aurora">AssetFlow</p>
          <h1 className="mt-2 text-xl font-semibold text-white">Enterprise Asset ERP</h1>
          <p className="mt-2 text-sm text-slate-400">Structured around assets, bookings, maintenance, audits, and notifications.</p>
        </div>

        <nav className="mt-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = item.id === activeScreen;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border px-4 py-3 transition ${
                  isActive ? 'border-aurora/40 bg-aurora/10' : 'border-white/8 bg-white/3 hover:bg-white/6'
                }`}
              >
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-slate-400">{item.caption}</div>
              </div>
            );
          })}
        </nav>
      </aside>

      <section className="space-y-4">{children}</section>
    </div>
  );
}
