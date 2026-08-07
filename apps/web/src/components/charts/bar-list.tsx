type BarListEntry = {
  label: string;
  count: number;
  /** Overrides the default mark colour when the colour itself is the data. */
  swatch?: string;
};

type BarListProps = {
  title: string;
  entries: BarListEntry[];
  emptyMessage?: string;
};

/**
 * Single-series magnitude comparison, so every mark carries the same hue: bar length is the
 * encoding and colour would only repeat it. Values are shown because the list is short.
 */
export const BarList = ({ title, entries, emptyMessage = 'Sin datos todavía' }: BarListProps) => {
  const max = entries.reduce((highest, entry) => Math.max(highest, entry.count), 0);

  return (
    <section className="panel px-4 py-3.5" aria-labelledby={`chart-${slug(title)}`}>
      <h3 id={`chart-${slug(title)}`} className="font-display mb-3 text-base font-bold">
        {title}
      </h3>

      {entries.length === 0 ? (
        <p className="text-ink-500 py-4 text-center text-sm">{emptyMessage}</p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {entries.map((entry) => (
            <li
              key={entry.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3"
            >
              <span className="truncate text-sm" title={entry.label}>
                {entry.label}
              </span>
              <span className="text-ink-300 text-sm tabular-nums">{entry.count}</span>
              <div
                className="col-span-2 h-2 overflow-hidden rounded-full bg-white/8"
                role="img"
                aria-label={`${entry.label}: ${String(entry.count)}`}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${String(max === 0 ? 0 : Math.max(3, (entry.count / max) * 100))}%`,
                    backgroundColor: entry.swatch ?? 'var(--color-chart-1)',
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
