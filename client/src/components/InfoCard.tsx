export function InfoCard({ title, description, status }: { title: string; description: string; status: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-medium text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-ink-800/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
          {status}
        </span>
      </div>
    </article>
  );
}
