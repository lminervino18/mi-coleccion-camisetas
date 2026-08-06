import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import type { Database, Queryable } from '@camisetas/db';
import { schema } from '@camisetas/db';
import type {
  CreateShirtInput,
  ShirtColor,
  ShirtFilters,
  UpdateShirtInput,
} from '@camisetas/contracts';
import { conflict, notFound } from './errors';

export type ShirtRecord = typeof schema.shirts.$inferSelect & { colors: ShirtColor[] };

export type ShirtPage = {
  items: ShirtRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

/** Size ordering is semantic, not alphabetical, so it is expressed as an explicit rank. */
const SIZE_RANK = sql`array_position(ARRAY['XS','S','M','L','XL','XXL']::text[], ${schema.shirts.size}::text)`;

const SORT_COLUMNS = {
  createdAt: schema.shirts.createdAt,
  season: schema.shirts.season,
  club: schema.shirts.club,
  country: schema.shirts.country,
  league: schema.shirts.league,
} as const;

const buildFilterConditions = (userId: string, filters: ShirtFilters): SQL[] => {
  const conditions: SQL[] = [eq(schema.shirts.userId, userId)];

  if (filters.search !== undefined && filters.search.length > 0) {
    const pattern = `%${filters.search}%`;
    const matches = or(
      ilike(schema.shirts.club, pattern),
      ilike(schema.shirts.country, pattern),
      ilike(schema.shirts.league, pattern),
      ilike(schema.shirts.playerName, pattern),
      ilike(schema.shirts.season, pattern),
      ilike(schema.shirts.notes, pattern),
    );
    if (matches !== undefined) conditions.push(matches);
  }

  if (filters.kind.length > 0) conditions.push(inArray(schema.shirts.kind, filters.kind));
  if (filters.size.length > 0) conditions.push(inArray(schema.shirts.size, filters.size));
  if (filters.kit.length > 0) conditions.push(inArray(schema.shirts.kit, filters.kit));
  if (filters.league.length > 0) conditions.push(inArray(schema.shirts.league, filters.league));
  if (filters.country.length > 0) conditions.push(inArray(schema.shirts.country, filters.country));
  if (filters.favoritesOnly) conditions.push(eq(schema.shirts.isFavorite, true));

  if (filters.color.length > 0) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM ${schema.shirtColors} WHERE ${schema.shirtColors.shirtId} = ${schema.shirts.id} AND ${schema.shirtColors.color} IN ${filters.color})`,
    );
  }

  return conditions;
};

const attachColors = async (db: Database, shirts: ShirtRecord[]): Promise<ShirtRecord[]> => {
  if (shirts.length === 0) return shirts;

  const rows = await db
    .select({ shirtId: schema.shirtColors.shirtId, color: schema.shirtColors.color })
    .from(schema.shirtColors)
    .where(
      inArray(
        schema.shirtColors.shirtId,
        shirts.map((shirt) => shirt.id),
      ),
    );

  const byShirt = new Map<string, ShirtColor[]>();
  for (const row of rows) {
    const existing = byShirt.get(row.shirtId);
    if (existing === undefined) byShirt.set(row.shirtId, [row.color]);
    else existing.push(row.color);
  }

  for (const shirt of shirts) {
    shirt.colors = byShirt.get(shirt.id) ?? [];
  }
  return shirts;
};

/** Colours are loaded in one extra query rather than per shirt, avoiding an N+1. */
export const listShirts = async (
  db: Database,
  userId: string,
  filters: ShirtFilters,
): Promise<ShirtPage> => {
  const conditions = buildFilterConditions(userId, filters);
  const where = and(...conditions);

  const [totals] = await db.select({ value: count() }).from(schema.shirts).where(where);
  const totalItems = totals?.value ?? 0;

  const direction = filters.direction === 'asc' ? asc : desc;
  const orderBy =
    filters.sort === 'size' ? direction(SIZE_RANK) : direction(SORT_COLUMNS[filters.sort]);

  const rows = await db
    .select()
    .from(schema.shirts)
    .where(where)
    .orderBy(orderBy, desc(schema.shirts.id))
    .limit(filters.pageSize)
    .offset((filters.page - 1) * filters.pageSize);

  return {
    items: await attachColors(
      db,
      rows.map((row) => ({ ...row, colors: [] })),
    ),
    page: filters.page,
    pageSize: filters.pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / filters.pageSize),
  };
};

export const getShirt = async (
  db: Database,
  userId: string,
  shirtId: string,
): Promise<ShirtRecord> => {
  const [row] = await db
    .select()
    .from(schema.shirts)
    .where(and(eq(schema.shirts.id, shirtId), eq(schema.shirts.userId, userId)))
    .limit(1);

  if (row === undefined) throw notFound('No encontramos esa camiseta.');
  const [withColors] = await attachColors(db, [{ ...row, colors: [] }]);
  if (withColors === undefined) throw notFound('No encontramos esa camiseta.');
  return withColors;
};

type ConfirmedImage = { objectKey: string; width: number; height: number };

/**
 * Claims a pending upload for this user and marks it confirmed. Returning nothing means the
 * upload does not exist, belongs to someone else, was already used, or never received bytes.
 */
const claimUpload = async (
  db: Queryable,
  userId: string,
  uploadId: string,
): Promise<ConfirmedImage | null> => {
  const [row] = await db
    .update(schema.imageUploads)
    .set({ status: 'confirmed' })
    .where(
      and(
        eq(schema.imageUploads.id, uploadId),
        eq(schema.imageUploads.userId, userId),
        eq(schema.imageUploads.status, 'pending'),
        isNotNull(schema.imageUploads.width),
      ),
    )
    .returning({
      objectKey: schema.imageUploads.objectKey,
      width: schema.imageUploads.width,
      height: schema.imageUploads.height,
    });

  if (row === undefined || row.width === null || row.height === null) return null;
  return { objectKey: row.objectKey, width: row.width, height: row.height };
};

export const createShirt = async (
  db: Database,
  userId: string,
  input: CreateShirtInput,
): Promise<ShirtRecord> =>
  db.transaction(async (tx) => {
    const image = await claimUpload(tx, userId, input.imageUploadId);
    if (image === null) {
      throw conflict('La imagen ya no está disponible. Subila de nuevo.');
    }

    const [row] = await tx
      .insert(schema.shirts)
      .values({
        userId,
        kind: input.kind,
        club: input.club,
        league: input.league,
        country: input.country,
        season: input.season,
        kit: input.kit,
        size: input.size,
        playerName: input.playerName,
        squadNumber: input.squadNumber,
        notes: input.notes,
        isFavorite: input.isFavorite,
        imageKey: image.objectKey,
        imageWidth: image.width,
        imageHeight: image.height,
      })
      .returning();

    if (row === undefined) throw new Error('Insert returned no row.');

    await tx
      .insert(schema.shirtColors)
      .values(input.colors.map((color) => ({ shirtId: row.id, color })));

    return { ...row, colors: input.colors };
  });

export const updateShirt = async (
  db: Database,
  userId: string,
  shirtId: string,
  input: UpdateShirtInput,
): Promise<ShirtRecord> =>
  db.transaction(async (tx) => {
    const uploadId = input.imageUploadId;
    let image: ConfirmedImage | null = null;

    if (uploadId !== null) {
      image = await claimUpload(tx, userId, uploadId);
      if (image === null) {
        throw conflict('La imagen ya no está disponible. Subila de nuevo.');
      }
    }

    const [row] = await tx
      .update(schema.shirts)
      .set({
        kind: input.kind,
        club: input.club,
        league: input.league,
        country: input.country,
        season: input.season,
        kit: input.kit,
        size: input.size,
        playerName: input.playerName,
        squadNumber: input.squadNumber,
        notes: input.notes,
        isFavorite: input.isFavorite,
        updatedAt: new Date(),
        ...(image === null
          ? {}
          : { imageKey: image.objectKey, imageWidth: image.width, imageHeight: image.height }),
      })
      .where(and(eq(schema.shirts.id, shirtId), eq(schema.shirts.userId, userId)))
      .returning();

    if (row === undefined) throw notFound('No encontramos esa camiseta.');

    await tx.delete(schema.shirtColors).where(eq(schema.shirtColors.shirtId, shirtId));
    await tx.insert(schema.shirtColors).values(input.colors.map((color) => ({ shirtId, color })));

    return { ...row, colors: input.colors };
  });

export const deleteShirt = async (
  db: Database,
  userId: string,
  shirtId: string,
): Promise<string> => {
  const [row] = await db
    .delete(schema.shirts)
    .where(and(eq(schema.shirts.id, shirtId), eq(schema.shirts.userId, userId)))
    .returning({ imageKey: schema.shirts.imageKey });

  if (row === undefined) throw notFound('No encontramos esa camiseta.');
  return row.imageKey;
};

export const toggleFavorite = async (
  db: Database,
  userId: string,
  shirtId: string,
): Promise<boolean> => {
  const [row] = await db
    .update(schema.shirts)
    .set({ isFavorite: sql`NOT ${schema.shirts.isFavorite}`, updatedAt: new Date() })
    .where(and(eq(schema.shirts.id, shirtId), eq(schema.shirts.userId, userId)))
    .returning({ isFavorite: schema.shirts.isFavorite });

  if (row === undefined) throw notFound('No encontramos esa camiseta.');
  return row.isFavorite;
};
