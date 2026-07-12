type ChartSegment = {
  label: string;
  value: number;
  color: string;
};

type ReportChartProps = {
  title: string;
  segments: ChartSegment[];
  variant?: 'bar' | 'donut';
};

const chartColors = ['#5eead4', '#fbbf24', '#fb7185', '#60a5fa', '#a78bfa'];

export function ReportChart({ title, segments, variant = 'bar' }: ReportChartProps) {
  const maxValue = Math.max(...segments.map((segment) => segment.value), 1);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (variant === 'donut') {
    let cumulative = 0;
    const slices = segments.map((segment, index) => {
      const start = (cumulative / total) * 360;
      cumulative += segment.value;
      const end = (cumulative / total) * 360;
      const largeArc = end - start > 180 ? 1 : 0;
      const startX = 50 + 40 * Math.cos((Math.PI * start) / 180);
      const startY = 50 + 40 * Math.sin((Math.PI * start) / 180);
      const endX = 50 + 40 * Math.cos((Math.PI * end) / 180);
      const endY = 50 + 40 * Math.sin((Math.PI * end) / 180);
      const color = segment.color || chartColors[index % chartColors.length];

      return (
        <path
          key={segment.label}
          d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
          fill={color}
          opacity={0.9}
        />
      );
    });

    return (
      <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr] md:items-center">
          <svg viewBox="0 0 100 100" className="mx-auto h-40 w-40">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            {slices}
            <circle cx="50" cy="50" r="22" fill="#0f172a" />
            <text x="50" y="54" textAnchor="middle" fill="#e2e8f0" fontSize="10">
              {total}
            </text>
          </svg>
          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div key={segment.label} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: segment.color || chartColors[index % chartColors.length] }}
                  />
                  <span className="text-slate-300">{segment.label}</span>
                </div>
                <span className="font-medium text-white">{segment.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
      <h4 className="text-sm font-medium text-white">{title}</h4>
      <div className="mt-4 space-y-3">
        {segments.map((segment, index) => {
          const width = `${Math.round((segment.value / maxValue) * 100)}%`;
          const color = segment.color || chartColors[index % chartColors.length];

          return (
            <div key={segment.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-300">{segment.label}</span>
                <span className="font-medium text-white">{segment.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all duration-500" style={{ width, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BookingHeatmap({
  title,
  cells
}: {
  title: string;
  cells: { label: string; intensity: number }[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
      <h4 className="text-sm font-medium text-white">{title}</h4>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {cells.map((cell) => (
          <div key={cell.label} className="text-center">
            <div
              className="mx-auto h-10 w-10 rounded-xl border border-white/10"
              style={{ backgroundColor: `rgba(94, 234, 212, ${0.15 + cell.intensity * 0.75})` }}
              title={`${cell.label}: ${Math.round(cell.intensity * 100)}% load`}
            />
            <div className="mt-1 text-[10px] text-slate-400">{cell.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
