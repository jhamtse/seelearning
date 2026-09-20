export default function BarBreakdown({
  items,
}: {
  items: { label: string; count: number; colorClass?: string }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 flex-shrink-0 truncate text-zinc-600">
            {item.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full ${item.colorClass ?? "bg-zinc-400"}`}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 flex-shrink-0 text-right font-medium text-zinc-700">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}
