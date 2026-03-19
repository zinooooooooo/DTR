export default function ProgressBar({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  return (
    <div className="w-full">
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-600 transition-[width] dark:bg-emerald-500"
          style={{ width: `${pct}%` }}
          aria-label="Progress"
          aria-valuenow={value}
          aria-valuemax={safeMax}
          role="progressbar"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{pct.toFixed(0)}%</span>
        <span>
          {value.toFixed(2)} / {max.toFixed(2)} hrs
        </span>
      </div>
    </div>
  );
}

