import Image from 'next/image';
import Link from 'next/link';

export const EmptyCollection = ({ isFiltered }: { isFiltered: boolean }) => (
  <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
    <Image src="/logo.png" alt="" width={64} height={90} className="h-16 w-auto opacity-60" />

    {isFiltered ? (
      <>
        <h2 className="font-display text-xl font-bold">Ninguna camiseta coincide</h2>
        <p className="text-ink-300 max-w-sm text-sm text-balance">
          Probá quitando algún filtro o buscando otra cosa.
        </p>
        <Link
          href="/coleccion"
          className="text-celeste-400 mt-1 text-sm font-medium hover:underline"
        >
          Limpiar filtros
        </Link>
      </>
    ) : (
      <>
        <h2 className="font-display text-xl font-bold">Todavía no cargaste camisetas</h2>
        <p className="text-ink-300 max-w-sm text-sm text-balance">
          Cuando agregues la primera vas a poder filtrarla, ordenarla, ver estadísticas y compartir
          tu colección.
        </p>
        <Link
          href="/camiseta/nueva"
          className="bg-brand-500 hover:bg-brand-600 mt-2 inline-flex min-h-11 items-center rounded-[6px] px-5 font-semibold text-white transition-colors"
        >
          Agregar mi primera camiseta
        </Link>
      </>
    )}
  </div>
);
