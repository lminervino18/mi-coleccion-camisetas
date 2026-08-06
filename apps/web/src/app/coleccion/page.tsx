import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { LogoutButton } from './logout-button';

export const metadata: Metadata = {
  title: 'Mi colección',
  robots: { index: false },
};

const CollectionPage = async () => {
  const user = await getCurrentUser();
  if (user === null) redirect('/login');

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Mi colección</h1>
          <p className="text-pitch-400 text-sm">Hola, {user.displayName ?? user.username}</p>
        </div>
        <LogoutButton />
      </header>

      <div className="border-white/8 flex flex-col items-center gap-3 rounded-[--radius-card] border border-dashed px-6 py-16 text-center">
        <p aria-hidden className="text-4xl">
          👕
        </p>
        <h2 className="text-lg font-medium">Todavía no cargaste camisetas</h2>
        <p className="text-pitch-400 max-w-sm text-balance text-sm">
          Cuando agregues la primera, vas a poder filtrarla, ordenarla y compartir tu colección.
        </p>
      </div>
    </main>
  );
};

export default CollectionPage;
