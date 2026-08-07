import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { ShirtForm } from '@/components/shirt-form';

export const metadata: Metadata = {
  title: 'Agregar camiseta',
  robots: { index: false },
};

const NewShirtPage = async () => {
  if ((await getCurrentUser()) === null) redirect('/login');

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5 sm:py-6">
      <Link
        href="/coleccion"
        className="text-ink-100 mb-4 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
      >
        ← Volver
      </Link>

      <div className="panel p-4 sm:p-6">
        <h1 className="font-display mb-5 text-xl font-bold sm:text-2xl">Agregar camiseta</h1>
        <ShirtForm />
      </div>
    </main>
  );
};

export default NewShirtPage;
