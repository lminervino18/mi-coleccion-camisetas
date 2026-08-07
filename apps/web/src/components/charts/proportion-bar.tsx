type Segment = {
  label: string;
  count: number;
  color: string;
};

type ProportionBarProps = {
  title: string;
  segments: Segment[];
};

/**
 * Part-to-whole for a couple of categories: a stacked bar rather than a two-slice pie, which
 * is harder to read and was what the previous statistics screen used.
 */
export const ProportionBar = ({ title, segments }: ProportionBarProps) => {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const present = segments.filter((segment) => segment.count > 0);

  return (
    <section className="panel px-4 py-3.5" aria-labelledby="chart-proporcion">
      <h3 id="chart-proporcion" className="font-display mb-3 text-base font-bold">
        {title}
      </h3>

      {total === 0 ? (
        <p className="text-ink-500 py-4 text-center text-sm">Sin datos todavía</p>
      ) : (
        <>
          {/* gap-0.5 is the 2px surface gap between adjacent fills. */}
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-white/8">
            {present.map((segment) => (
              <div
                key={segment.label}
                style={{
                  width: `${String((segment.count / total) * 100)}%`,
                  backgroundColor: segment.color,
                }}
                className="first:rounded-l-full last:rounded-r-full"
              />
            ))}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {segments.map((segment) => (
              <li key={segment.label} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span>{segment.label}</span>
                <span className="text-ink-300 tabular-nums">
                  {segment.count}
                  {total > 0 ? ` · ${String(Math.round((segment.count / total) * 100))}%` : ''}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};
