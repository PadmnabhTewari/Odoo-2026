import type { KpiCard as KpiCardType } from '../types/assetflow';

const toneStyles: Record<KpiCardType['tone'], string> = {
  aurora: 'text-aurora border-aurora/25 bg-aurora/10',
  ember: 'text-ember border-ember/25 bg-ember/10',
  gold: 'text-gold border-gold/25 bg-gold/10'
};

export function KpiCard({ label, value, delta, tone }: KpiCardType) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-glow backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-white/20">
      <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-aurora/10 blur-2xl transition group-hover:bg-aurora/20" />
      <div className="relative text-sm text-slate-400">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="relative text-4xl font-semibold tracking-tight text-white">{value}</div>
        <div className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${toneStyles[tone]}`}>
          {delta}
        </div>
      </div>
      <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full w-2/3 rounded-full ${tone === 'aurora' ? 'bg-aurora' : tone === 'ember' ? 'bg-ember' : 'bg-gold'}`} />
      </div>
    </article>
  );
}
