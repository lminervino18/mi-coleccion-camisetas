import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { shirtFiltersSchema } from '@camisetas/contracts';
import { listShirts, resolveShareToken } from '@camisetas/core';
import { appUrl } from '@/server/auth';
import { db } from '@/server/db';
import { toPublicProfile, toShirt } from '@/server/serializers';
import { Pagination } from '@/components/pagination';
import { ShirtCard } from '@/components/shirt-card';
import { ExpiredShareLink } from './expired-share-link';

type Params = { params: Promise<{ token: string }> };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PREVIEW_PAGE = shirtFiltersSchema.parse({ pageSize: '12' });

const loadSharedCollection = async (token: string) => {
  const owner = await resolveShareToken(db, token);
  if (owner === null) return null;

  const page = await listShirts(db, owner.userId, PREVIEW_PAGE);
  return { owner, page };
};

/**
 * Rendered on the server so link previews work: crawlers for WhatsApp, Telegram and the rest
 * never execute JavaScript, so these tags have to be in the delivered HTML.
 */
export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const shared = await loadSharedCollection((await params).token);

  if (shared === null) {
    return { title: 'Enlace no disponible', robots: { index: false } };
  }

  const profile = toPublicProfile(shared.owner);
  const name = profile.displayName ?? profile.username;
  const count = shared.page.totalItems;
  const title = `La colección de ${name}`;
  const description = `${String(count)} ${count === 1 ? 'camiseta' : 'camisetas'} de fútbol en Mi Colección de Camisetas.`;
  const cover = shared.page.items[0];

  return {
    title,
    description,
    // Share tokens are capabilities: keep them out of search results.
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title,
      description,
      url: appUrl(`/c/${(await params).token}`),
      images: cover === undefined ? [] : [{ url: toShirt(cover).image.fullUrl }],
    },
    twitter: {
      card: cover === undefined ? 'summary' : 'summary_large_image',
      title,
      description,
    },
  };
};

const SharedCollectionPage = async ({
  params,
  searchParams,
}: {
  params: Params['params'];
  searchParams: SearchParams;
}) => {
  const token = (await params).token;
  const rawParams = await searchParams;
  const filters = shirtFiltersSchema.parse(rawParams);
  const owner = await resolveShareToken(db, token);

  if (owner === null) return <ExpiredShareLink />;

  const page = await listShirts(db, owner.userId, filters);
  const profile = toPublicProfile(owner);
  const shirts = page.items.map(toShirt);
  const name = profile.displayName ?? profile.username;

  return (
    <main id="main" className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6">
      <header className="panel mb-5 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {profile.avatarUrl === null ? (
            <span
              aria-hidden
              className="bg-ink-700 font-display grid size-11 shrink-0 place-items-center rounded-full text-lg font-bold"
            >
              {name.slice(0, 1).toUpperCase()}
            </span>
          ) : (
            <Image
              src={profile.avatarUrl}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-full object-cover"
            />
          )}
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-bold sm:text-xl">
              La colección de {name}
            </h1>
            <p className="text-ink-300 text-sm">
              {page.totalItems} {page.totalItems === 1 ? 'camiseta' : 'camisetas'}
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="bg-brand-500 hover:bg-brand-600 inline-flex min-h-11 items-center rounded-[6px] px-4 text-sm font-semibold text-white transition-colors"
        >
          Creá la tuya
        </Link>
      </header>

      {shirts.length === 0 ? (
        <div className="panel px-6 py-14 text-center">
          <h2 className="font-display text-lg font-bold">Esta colección todavía está vacía</h2>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {shirts.map((shirt, index) => (
              <li key={shirt.id}>
                <ShirtCard shirt={shirt} href={`/c/${token}/${shirt.id}`} priority={index < 4} />
              </li>
            ))}
          </ul>

          <Pagination
            page={page.page}
            totalPages={page.totalPages}
            totalItems={page.totalItems}
            baseParams={new URLSearchParams()}
            basePath={`/c/${token}`}
          />
        </>
      )}
    </main>
  );
};

export default SharedCollectionPage;
