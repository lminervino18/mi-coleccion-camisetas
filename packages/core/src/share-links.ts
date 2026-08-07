import { and, desc, eq, isNull, or, gt, sql } from 'drizzle-orm';
import type { Database } from '@camisetas/db';
import { schema } from '@camisetas/db';
import { generateToken, hashToken } from './tokens';
import { notFound } from './errors';

export type ShareLinkRecord = typeof schema.shareLinks.$inferSelect;

export type IssuedShareLink = { record: ShareLinkRecord; token: string };

/** The plain token is returned once; only its hash is persisted. */
export const createShareLink = async (
  db: Database,
  userId: string,
  expiresInDays: number | null,
): Promise<IssuedShareLink> => {
  const token = generateToken();
  const expiresAt =
    expiresInDays === null ? null : new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const [record] = await db
    .insert(schema.shareLinks)
    .values({ userId, tokenHash: hashToken(token), expiresAt })
    .returning();

  if (record === undefined) throw new Error('Insert returned no row.');
  return { record, token };
};

export type SharedCollectionOwner = {
  userId: string;
  username: string;
  displayName: string | null;
  avatarKey: string | null;
  bio: string | null;
  favoriteClub: string | null;
  country: string | null;
  collectingSince: number | null;
};

/**
 * Resolves the owner behind a share token. Revoked and expired links resolve to null so the
 * caller can render a dedicated page instead of an empty collection.
 */
export const resolveShareToken = async (
  db: Database,
  token: string,
): Promise<SharedCollectionOwner | null> => {
  const rows = await db
    .select({
      userId: schema.users.id,
      username: schema.users.username,
      displayName: schema.users.displayName,
      avatarKey: schema.users.avatarKey,
      bio: schema.users.bio,
      favoriteClub: schema.users.favoriteClub,
      country: schema.users.country,
      collectingSince: schema.users.collectingSince,
    })
    .from(schema.shareLinks)
    .innerJoin(schema.users, eq(schema.users.id, schema.shareLinks.userId))
    .where(
      and(
        eq(schema.shareLinks.tokenHash, hashToken(token)),
        isNull(schema.shareLinks.revokedAt),
        or(isNull(schema.shareLinks.expiresAt), gt(schema.shareLinks.expiresAt, new Date())),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
};

export const listShareLinks = (db: Database, userId: string): Promise<ShareLinkRecord[]> =>
  db
    .select()
    .from(schema.shareLinks)
    .where(and(eq(schema.shareLinks.userId, userId), isNull(schema.shareLinks.revokedAt)))
    .orderBy(desc(schema.shareLinks.createdAt));

export const revokeShareLink = async (
  db: Database,
  userId: string,
  shareLinkId: string,
): Promise<void> => {
  const [row] = await db
    .update(schema.shareLinks)
    .set({ revokedAt: sql`now()` })
    .where(
      and(
        eq(schema.shareLinks.id, shareLinkId),
        eq(schema.shareLinks.userId, userId),
        isNull(schema.shareLinks.revokedAt),
      ),
    )
    .returning({ id: schema.shareLinks.id });

  if (row === undefined) throw notFound('No encontramos ese enlace.');
};
