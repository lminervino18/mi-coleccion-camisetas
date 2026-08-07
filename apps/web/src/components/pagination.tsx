import Link from 'next/link';

type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  /** Current query string without the page parameter, ready to be extended. */
  baseParams: URLSearchParams;
  basePath: string;
};

const hrefFor = (basePath: string, params: URLSearchParams, page: number) => {
  const next = new URLSearchParams(params.toString());
  if (page <= 1) next.delete('page');
  else next.set('page', String(page));

  const query = next.toString();
  return query === '' ? basePath : `${basePath}?${query}`;
};

const linkClass =
  'text-ink-100 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16';

const disabledClass =
  'text-ink-500 inline-flex min-h-11 items-center rounded-[6px] border border-white/8 px-4 text-sm';

export const Pagination = ({
  page,
  totalPages,
  totalItems,
  baseParams,
  basePath,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación de la colección"
      className="mt-5 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-ink-300 text-sm" aria-live="polite">
        Página {page} de {totalPages} · {totalItems} {totalItems === 1 ? 'camiseta' : 'camisetas'}
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={hrefFor(basePath, baseParams, page - 1)} rel="prev" className={linkClass}>
            ← Anterior
          </Link>
        ) : (
          <span className={disabledClass} aria-hidden>
            ← Anterior
          </span>
        )}

        {page < totalPages ? (
          <Link href={hrefFor(basePath, baseParams, page + 1)} rel="next" className={linkClass}>
            Siguiente →
          </Link>
        ) : (
          <span className={disabledClass} aria-hidden>
            Siguiente →
          </span>
        )}
      </div>
    </nav>
  );
};
