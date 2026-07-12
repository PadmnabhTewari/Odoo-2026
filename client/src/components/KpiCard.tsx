import type { KpiCard as KpiCardType } from '../types/assetflow';

const toneStyles: Record<KpiCardType['tone'], string> = {
  aurora: 'text-aurora border-aurora/25 bg-aurora/10',
  ember: 'text-ember border-ember/25 bg-ember/10',
  gold: 'text-gold border-gold/25 bg-gold/10'
};

export function KpiCard({ label, value, delta, tone }: KpiCardType) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-glow backdrop-blur">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="text-4xl font-semibold tracking-tight text-white">{value}</div>
        <div className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${toneStyles[tone]}`}>
          {delta}
        </div>
      </div>
    </article>
  );
}
