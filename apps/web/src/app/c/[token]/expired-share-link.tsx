import Image from 'next/image';
import Link from 'next/link';

export const ExpiredShareLink = () => (
  <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
    <div className="panel w-full max-w-md p-8 text-center">
      <Image src="/logo.png" alt="" width={72} height={102} className="mx-auto mb-5 h-18 w-auto" />
      <h1 className="font-display mb-2 text-2xl font-bold">Este enlace ya no está disponible</h1>
      <p className="text-ink-300 mb-6 text-balance">
        Puede que haya vencido o que la persona que lo compartió lo haya dado de baja. Pedile un
        enlace nuevo.
      </p>
      <Link
        href="/"
        className="bg-brand-500 hover:bg-brand-600 inline-flex min-h-11 items-center rounded-[6px] px-5 font-semibold text-white transition-colors"
      >
        Ir al inicio
      </Link>
    </div>
  </main>
);
