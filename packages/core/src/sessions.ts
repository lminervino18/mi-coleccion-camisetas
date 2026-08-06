import { and, eq, gt, lt, ne } from 'drizzle-orm';
import type { Database } from '@camisetas/db';
import { schema } from '@camisetas/db';
import { generateToken, hashToken } from './tokens';

export const SESSION_COOKIE = 'camisetas_session';
export const SESSION_TTL_DAYS = 30;

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarKey: string | null;
  createdAt: Date;
};

export type CreatedSession = { token: string; expiresAt: Date };

const expiryFromNow = (): Date => new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

export const createSession = async (
  db: Database,
  userId: string,
  userAgent: string | null,
): Promise<CreatedSession> => {
  const token = generateToken();
  const expiresAt = expiryFromNow();
  await db.insert(schema.sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    userAgent,
  });
  return { token, expiresAt };
};

/**
 * Resolves the session owner, treating expired rows as absent. The lookup is by token hash on a
 * unique index; the caller never supplies a user id.
 */
export const resolveSession = async (
  db: Database,
  token: string,
): Promise<AuthenticatedUser | null> => {
  const rows = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      displayName: schema.users.displayName,
      avatarKey: schema.users.avatarKey,
      createdAt: schema.users.createdAt,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(
      and(
        eq(schema.sessions.tokenHash, hashToken(token)),
        gt(schema.sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
};

export const revokeSession = async (db: Database, token: string): Promise<void> => {
  await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, hashToken(token)));
};

/** Used after a password change so other devices are signed out but the caller stays in. */
export const revokeOtherSessions = async (
  db: Database,
  userId: string,
  keepToken: string,
): Promise<void> => {
  await db
    .delete(schema.sessions)
    .where(
      and(eq(schema.sessions.userId, userId), ne(schema.sessions.tokenHash, hashToken(keepToken))),
    );
};

export const deleteExpiredSessions = async (db: Database): Promise<void> => {
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
};
