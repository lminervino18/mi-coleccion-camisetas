import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { CollectorMosaic } from '@/components/collector-mosaic';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Mi Colección de Camisetas',
  description:
    'Catalogá, organizá y compartí tu colección de camisetas de fútbol. Cada casaca cuenta una historia.',
  openGraph: {
    title: 'Mi Colección de Camisetas',
    description: 'Las camisetas que amás, ahora organizadas.',
  },
};

const HomePage = async () => {
  if ((await getCurrentUser()) !== null) redirect('/coleccion');

  return (
    <div className="relative min-h-dvh">
      <CollectorMosaic />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-5 sm:px-6">
        <header className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={40} height={57} className="h-9 w-auto" priority />
          <span className="font-display text-base font-bold drop-shadow-[2px_2px_6px_rgb(0_0_0/0.9)] sm:text-lg">
            Mi Colección de Camisetas
          </span>
        </header>

        <main
          id="main"
          className="flex flex-1 flex-col items-center gap-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-0"
        >
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="font-display text-3xl leading-[1.15] font-bold text-balance drop-shadow-[2px_3px_12px_rgb(0_0_0/0.95)] sm:text-5xl">
              Cada casaca cuenta una historia
            </h1>
            <p className="text-ink-200 mt-5 text-base text-pretty drop-shadow-[1px_1px_8px_rgb(0_0_0/0.95)] sm:text-lg">
              Catalogá tus camisetas, organizalas como quieras, mirá cómo se compone tu colección y
              compartila con quien vos elijas.
            </p>
            <p className="font-display text-celeste-400 mt-5 text-lg drop-shadow-[1px_1px_8px_rgb(0_0_0/0.95)] sm:text-xl">
              Las camisetas que amás, ahora organizadas.
            </p>
          </div>

          <div className="panel w-full max-w-sm shrink-0 p-6">
            <h2 className="font-display mb-1 text-lg font-bold">Entrá a tu colección</h2>
            <p className="text-ink-300 mb-5 text-sm">Ingresá con tu usuario y contraseña.</p>

            <LoginForm />

            <p className="text-ink-300 mt-5 text-center text-sm">
              ¿Todavía no tenés cuenta?{' '}
              <Link href="/registro" className="text-celeste-400 font-medium hover:underline">
                Creá una
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
