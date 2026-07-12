export interface BreakdownRow {
  label: string;
  count: number;
}

export interface BreakdownBarListProps {
  rows: BreakdownRow[];
}

export function BreakdownBarList({ rows }: BreakdownBarListProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  if (rows.length === 0 || total === 0) {
    return <p className="text-body-sm text-foreground-tertiary">Немає даних.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const pct = Math.round((row.count / total) * 100);
        return (
          <div key={row.label}>
            <div className="text-body-sm text-foreground-secondary mb-1 flex items-center justify-between">
              <span>{row.label}</span>
              <span className="text-foreground font-medium">
                {row.count} ({pct}%)
              </span>
            </div>
            <div className="bg-surface-secondary h-2 overflow-hidden rounded-full">
              <div className="bg-accent-400 h-full rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
