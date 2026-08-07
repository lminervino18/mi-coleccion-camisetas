import { and, countDistinct, desc, eq, isNotNull, sql } from 'drizzle-orm';
import type { Database } from '@camisetas/db';
import { schema } from '@camisetas/db';
import type { CollectionStatistics } from '@camisetas/contracts';

const TOP_LIMIT = 8;

type Tally<T extends string = string> = { label: T; count: number };

const groupBy = async <T extends string>(
  db: Database,
  userId: string,
  column: Parameters<typeof countDistinct>[0],
): Promise<Tally<T>[]> => {
  const rows = await db
    .select({ label: sql<T>`${column}::text`, value: sql<number>`count(*)::int` })
    .from(schema.shirts)
    .where(and(eq(schema.shirts.userId, userId), isNotNull(column)))
    .groupBy(sql`${column}`)
    .orderBy(desc(sql`count(*)`));

  return rows.map((row) => ({ label: row.label, count: row.value }));
};

const topBy = async (
  db: Database,
  userId: string,
  column: Parameters<typeof countDistinct>[0],
): Promise<Tally[]> => {
  const rows = await db
    .select({ label: sql<string>`${column}`, value: sql<number>`count(*)::int` })
    .from(schema.shirts)
    .where(and(eq(schema.shirts.userId, userId), isNotNull(column)))
    .groupBy(sql`${column}`)
    .orderBy(desc(sql`count(*)`), sql`${column}`)
    .limit(TOP_LIMIT);

  return rows.map((row) => ({ label: row.label, count: row.value }));
};

/**
 * Every figure is computed in SQL rather than by loading the collection into memory, which is
 * what made the previous statistics screen refetch and re-process the whole set of images.
 */
export const calculateCollectionStatistics = async (
  db: Database,
  userId: string,
): Promise<CollectionStatistics> => {
  const owned = eq(schema.shirts.userId, userId);

  const [totals] = await db
    .select({
      totalShirts: sql<number>`count(*)::int`,
      distinctCountries: countDistinct(schema.shirts.country),
      distinctClubs: countDistinct(schema.shirts.club),
      distinctLeagues: countDistinct(schema.shirts.league),
    })
    .from(schema.shirts)
    .where(owned);

  const colorRows = await db
    .select({
      label: sql<string>`${schema.shirtColors.color}::text`,
      value: sql<number>`count(*)::int`,
    })
    .from(schema.shirtColors)
    .innerJoin(schema.shirts, eq(schema.shirts.id, schema.shirtColors.shirtId))
    .where(owned)
    .groupBy(schema.shirtColors.color)
    .orderBy(desc(sql`count(*)`));

  const decadeRows = await db
    .select({
      label: sql<string>`concat(substring(${schema.shirts.season} from 1 for 3), '0s')`,
      value: sql<number>`count(*)::int`,
    })
    .from(schema.shirts)
    .where(owned)
    .groupBy(sql`substring(${schema.shirts.season} from 1 for 3)`)
    .orderBy(sql`substring(${schema.shirts.season} from 1 for 3)`);

  const [byKind, byKit, bySize, topClubs, topCountries, topLeagues, topPlayers] = await Promise.all(
    [
      groupBy<'club' | 'national'>(db, userId, schema.shirts.kind),
      groupBy<'home' | 'away' | 'third' | 'goalkeeper' | 'special'>(db, userId, schema.shirts.kit),
      groupBy<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'>(db, userId, schema.shirts.size),
      topBy(db, userId, schema.shirts.club),
      topBy(db, userId, schema.shirts.country),
      topBy(db, userId, schema.shirts.league),
      topBy(db, userId, schema.shirts.playerName),
    ],
  );

  return {
    totalShirts: totals?.totalShirts ?? 0,
    distinctCountries: totals?.distinctCountries ?? 0,
    distinctClubs: totals?.distinctClubs ?? 0,
    distinctLeagues: totals?.distinctLeagues ?? 0,
    byKind,
    byKit,
    bySize,
    byColor: colorRows.map((row) => ({
      label: row.label as CollectionStatistics['byColor'][number]['label'],
      count: row.value,
    })),
    topClubs,
    topCountries,
    topLeagues,
    topPlayers,
    byDecade: decadeRows.map((row) => ({ label: row.label, count: row.value })),
  };
};
