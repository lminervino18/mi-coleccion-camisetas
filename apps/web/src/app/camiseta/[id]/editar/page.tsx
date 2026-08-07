import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { shirtTitle } from '@camisetas/contracts';
import { DomainError, getShirt } from '@camisetas/core';
import { getCurrentUser } from '@/server/auth';
import { db } from '@/server/db';
import { toShirt } from '@/server/serializers';
import { ShirtForm } from '@/components/shirt-form';

type Params = { params: Promise<{ id: string }> };

const loadShirt = async (id: string) => {
  const user = await getCurrentUser();
  if (user === null) redirect('/');

  try {
    return toShirt(await getShirt(db, user.id, id));
  } catch (error) {
    if (error instanceof DomainError && error.code === 'not_found') notFound();
    throw error;
  }
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const shirt = await loadShirt((await params).id);
  return { title: `Editar ${shirtTitle(shirt)}`, robots: { index: false } };
};

const EditShirtPage = async ({ params }: Params) => {
  const shirt = await loadShirt((await params).id);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5 sm:py-6">
      <Link
        href={`/camiseta/${shirt.id}`}
        className="text-ink-100 mb-4 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
      >
        ← Volver
      </Link>

      <div className="panel p-4 sm:p-6">
        <h1 className="font-display mb-5 text-xl font-bold sm:text-2xl">
          Editar {shirtTitle(shirt)}
        </h1>
        <ShirtForm shirt={shirt} />
      </div>
    </main>
  );
};

export default EditShirtPage;
