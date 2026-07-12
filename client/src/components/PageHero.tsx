export function PageHero({ title, subtitle, badge }: { title: string; subtitle: string; badge: string }) {
  return (
    <header className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur sm:p-7">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-aurora/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-24 h-24 w-24 rounded-full bg-ember/10 blur-3xl" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.32em] text-aurora">AssetFlow</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{subtitle}</p>
        </div>
        <div className="relative self-start rounded-full border border-aurora/30 bg-aurora/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-aurora lg:self-auto">
          {badge}
        </div>
      </div>
    </header>
  );
}
