type StatTileProps = {
  label: string;
  value: number;
};

/** A headline number is a stat tile, not a one-bar chart. */
export const StatTile = ({ label, value }: StatTileProps) => (
  <div className="panel px-4 py-3.5 text-center">
    <p className="font-display text-3xl leading-none font-bold tabular-nums sm:text-4xl">{value}</p>
    <p className="text-ink-300 mt-1.5 text-xs tracking-wide uppercase">{label}</p>
  </div>
);
