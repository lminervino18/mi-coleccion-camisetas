import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { listShareLinks } from '@camisetas/core';
import { getCurrentUser } from '@/server/auth';
import { db } from '@/server/db';
import { ShareManager } from './share-manager';

export const metadata: Metadata = {
  title: 'Compartir mi colección',
  robots: { index: false },
};

const SharePage = async () => {
  const user = await getCurrentUser();
  if (user === null) redirect('/');

  const links = await listShareLinks(db, user.id);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5 sm:py-6">
      <Link
        href="/coleccion"
        className="text-ink-100 mb-4 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
      >
        ← Volver
      </Link>

      <h1 className="font-display panel mb-4 px-4 py-3 text-center text-xl font-bold sm:text-2xl">
        Compartir mi colección
      </h1>

      <ShareManager
        links={links.map((link) => ({
          id: link.id,
          createdAt: link.createdAt.toISOString(),
          expiresAt: link.expiresAt?.toISOString() ?? null,
        }))}
      />
    </main>
  );
};

export default SharePage;
