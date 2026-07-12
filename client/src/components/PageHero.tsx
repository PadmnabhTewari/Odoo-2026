export function PageHero({ title, subtitle, badge }: { title: string; subtitle: string; badge: string }) {
  return (
    <header className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-aurora">AssetFlow</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{subtitle}</p>
        </div>
        <div className="rounded-full border border-aurora/30 bg-aurora/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-aurora">
          {badge}
        </div>
      </div>
    </header>
  );
}
