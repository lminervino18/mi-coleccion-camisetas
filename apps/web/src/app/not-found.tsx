import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false },
};

const NotFound = () => (
  <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
    <p aria-hidden className="text-5xl">
      🔍
    </p>
    <h1 className="text-2xl font-semibold">No encontramos esta página</h1>
    <p className="text-pitch-400 max-w-sm text-balance">
      Puede que el enlace esté mal escrito o que la página ya no exista.
    </p>
    <Link
      href="/"
      className="bg-grass-500 text-pitch-950 mt-2 inline-flex min-h-11 items-center rounded-[--radius-control] px-5 font-semibold"
    >
      Volver al inicio
    </Link>
  </main>
);

export default NotFound;
