import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { shirtFiltersSchema } from '@camisetas/contracts';
import { getCollectionFacets, listShirts } from '@camisetas/core';
import { getCurrentUser } from '@/server/auth';
import { db } from '@/server/db';
import { toShirt } from '@/server/serializers';
import { Pagination } from '@/components/pagination';
import { ShirtCard } from '@/components/shirt-card';
import { CollectionFilters } from './collection-filters';
import { CollectionHeader } from './collection-header';
import { EmptyCollection } from './empty-collection';

export const metadata: Metadata = {
  title: 'Mi colección',
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const CollectionPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const user = await getCurrentUser();
  if (user === null) redirect('/');

  const rawParams = await searchParams;
  const filters = shirtFiltersSchema.parse(rawParams);
  const [page, facets] = await Promise.all([
    listShirts(db, user.id, filters),
    getCollectionFacets(db, user.id),
  ]);
  const shirts = page.items.map(toShirt);

  return (
    <main id="main" className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6">
      <CollectionHeader user={user} totalItems={page.totalItems} />
      <CollectionFilters leagues={facets.leagues} countries={facets.countries} />

      {shirts.length === 0 ? (
        <EmptyCollection isFiltered={page.totalItems === 0 && hasActiveFilters(filters)} />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {shirts.map((shirt, index) => (
              <li key={shirt.id}>
                <ShirtCard shirt={shirt} href={`/camiseta/${shirt.id}`} priority={index < 4} />
              </li>
            ))}
          </ul>

          <Pagination
            page={page.page}
            totalPages={page.totalPages}
            totalItems={page.totalItems}
            baseParams={toSearchParams(rawParams)}
            basePath="/coleccion"
          />
        </>
      )}
    </main>
  );
};

/** Rebuilds the incoming query string so pagination links keep the active filters. */
const toSearchParams = (raw: Record<string, string | string[] | undefined>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (key === 'page' || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, item);
  }
  return params;
};

const hasActiveFilters = (filters: ReturnType<typeof shirtFiltersSchema.parse>): boolean =>
  filters.search !== undefined ||
  filters.kind.length > 0 ||
  filters.size.length > 0 ||
  filters.kit.length > 0 ||
  filters.color.length > 0 ||
  filters.league.length > 0 ||
  filters.country.length > 0 ||
  filters.favoritesOnly;

export default CollectionPage;
