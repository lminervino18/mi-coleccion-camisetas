import { and, eq, gt, isNull, lt } from 'drizzle-orm';
import type { Database } from '@camisetas/db';
import { schema } from '@camisetas/db';
import { hashPassword } from './passwords';
import { generateToken, hashToken } from './tokens';
import { validationFailed } from './errors';

export const RESET_TOKEN_TTL_MINUTES = 60;

export type IssuedResetToken = { token: string; email: string; username: string };

/**
 * Returns nothing when the address is unknown. The caller must respond identically either way so
 * the endpoint cannot be used to find out which addresses are registered.
 */
export const requestPasswordReset = async (
  db: Database,
  email: string,
): Promise<IssuedResetToken | null> => {
  const [user] = await db
    .select({ id: schema.users.id, email: schema.users.email, username: schema.users.username })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (user === undefined) return null;

  const token = generateToken();
  await db.insert(schema.passwordResetTokens).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
  });

  return { token, email: user.email, username: user.username };
};

/**
 * Consumes the token and sets the new password in one transaction, then drops every session so a
 * stolen session cannot outlive the reset. The token is single use: the update only matches rows
 * that are still unconsumed.
 */
export const resetPassword = async (
  db: Database,
  token: string,
  newPassword: string,
): Promise<void> => {
  const passwordHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    const [consumed] = await tx
      .update(schema.passwordResetTokens)
      .set({ consumedAt: new Date() })
      .where(
        and(
          eq(schema.passwordResetTokens.tokenHash, hashToken(token)),
          isNull(schema.passwordResetTokens.consumedAt),
          gt(schema.passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .returning({ userId: schema.passwordResetTokens.userId });

    if (consumed === undefined) {
      throw validationFailed('El enlace no es válido o ya venció. Pedí uno nuevo.');
    }

    await tx
      .update(schema.users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(schema.users.id, consumed.userId));

    await tx.delete(schema.sessions).where(eq(schema.sessions.userId, consumed.userId));
  });
};

export const deleteExpiredResetTokens = async (db: Database): Promise<void> => {
  await db
    .delete(schema.passwordResetTokens)
    .where(lt(schema.passwordResetTokens.expiresAt, new Date()));
};
