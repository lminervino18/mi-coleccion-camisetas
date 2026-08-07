import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { CollectorSlideshow } from '@/components/collector-slideshow';

export const metadata: Metadata = {
  title: 'Mi Colección de Camisetas',
  description:
    'Tu espacio personal para catalogar, organizar y compartir tu colección de camisetas de fútbol.',
  openGraph: {
    title: 'Mi Colección de Camisetas',
    description: 'Las camisetas que amás, ahora organizadas.',
  },
};

const HomePage = async () => {
  if ((await getCurrentUser()) !== null) redirect('/coleccion');

  return (
    <div className="relative min-h-dvh">
      <CollectorSlideshow />

      <div className="relative flex min-h-dvh flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="" width={40} height={57} className="h-10 w-auto" priority />
            <span className="font-display text-lg font-bold drop-shadow-[2px_2px_6px_rgba(0,0,0,0.9)] sm:text-xl">
              Mi Colección de Camisetas
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="bg-brand-500 hover:bg-brand-600 inline-flex min-h-11 items-center rounded-[6px] px-4 text-sm font-semibold text-white transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="text-ink-100 inline-flex min-h-11 items-center rounded-[6px] border border-white/20 bg-white/10 px-4 text-sm backdrop-blur-[2px] transition-colors hover:bg-white/20"
            >
              Registrarse
            </Link>
          </nav>
        </header>

        <main
          id="main"
          className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center"
        >
          <p className="font-display max-w-2xl text-2xl leading-snug font-bold text-balance drop-shadow-[2px_2px_10px_rgba(0,0,0,0.95)] sm:text-4xl">
            Cada casaca cuenta una historia
          </p>
          <p className="text-ink-200 mt-4 max-w-xl text-balance drop-shadow-[1px_1px_6px_rgba(0,0,0,0.95)] sm:text-lg">
            Catalogá tus camisetas, organizalas como quieras, mirá cómo se compone tu colección y
            compartila con quien vos elijas.
          </p>
          <p className="font-display text-celeste-400 mt-6 text-lg drop-shadow-[1px_1px_6px_rgba(0,0,0,0.95)] sm:text-xl">
            Las camisetas que amás, ahora organizadas.
          </p>

          <Link
            href="/registro"
            className="bg-brand-500 hover:bg-brand-600 mt-8 inline-flex min-h-12 items-center rounded-[8px] px-7 font-semibold text-white transition-colors"
          >
            Empezar mi colección
          </Link>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
