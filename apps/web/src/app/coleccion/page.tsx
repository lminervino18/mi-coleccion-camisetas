import type { Metadata } from 'next';
import Image from 'next/image';
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
    <main id="main" className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      <header className="panel mb-6 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={36} height={51} className="h-9 w-auto" />
          <div>
            <h1 className="font-display text-lg font-bold sm:text-xl">Mi colección</h1>
            <p className="text-ink-300 text-sm">{user.displayName ?? user.username}</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
        <Image src="/logo.png" alt="" width={64} height={90} className="h-16 w-auto opacity-70" />
        <h2 className="font-display text-xl font-bold">Todavía no cargaste camisetas</h2>
        <p className="text-ink-300 max-w-sm text-balance text-sm">
          Cuando agregues la primera, vas a poder filtrarla, ordenarla y compartir tu colección.
        </p>
      </div>
    </main>
  );
};

export default CollectionPage;
