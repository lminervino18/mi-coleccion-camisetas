import { cookies, headers } from 'next/headers';
import {
  SESSION_COOKIE,
  createSession,
  resolveSession,
  revokeSession,
  unauthenticated,
  type AuthenticatedUser,
} from '@camisetas/core';
import { db } from './db';
import { env, isProduction } from './env';

export const startSession = async (userId: string): Promise<void> => {
  const userAgent = (await headers()).get('user-agent');
  const { token, expiresAt } = await createSession(db, userId, userAgent);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
};

export const endSession = async (): Promise<void> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token !== undefined) await revokeSession(db, token);
  store.delete(SESSION_COOKIE);
};

/** Returns the signed-in user, or null for anonymous visitors. */
export const getCurrentUser = async (): Promise<AuthenticatedUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token === undefined) return null;
  return resolveSession(db, token);
};

/** Use in any route that must not serve anonymous visitors. */
export const requireUser = async (): Promise<AuthenticatedUser> => {
  const user = await getCurrentUser();
  if (user === null) throw unauthenticated();
  return user;
};

export const getSessionToken = async (): Promise<string | undefined> =>
  (await cookies()).get(SESSION_COOKIE)?.value;

export const appUrl = (path: string): string => new URL(path, env.APP_URL).toString();
