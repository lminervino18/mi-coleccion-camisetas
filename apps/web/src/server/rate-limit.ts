import { headers } from 'next/headers';
import { rateLimited } from '@camisetas/core';

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/**
 * In-process fixed window. Vercel may run several instances, so this bounds abuse per instance
 * rather than globally; it is a speed bump against credential stuffing, not a hard quota.
 * Swap for a shared store if the traffic ever justifies it.
 */
export const enforceRateLimit = (key: string, limit: number, windowMs: number): void => {
  const now = Date.now();
  const current = windows.get(key);

  if (current === undefined || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  current.count += 1;
  if (current.count > limit) throw rateLimited();

  if (windows.size > 10_000) {
    for (const [entryKey, entry] of windows) {
      if (entry.resetAt <= now) windows.delete(entryKey);
    }
  }
};

export const clientIdentifier = async (): Promise<string> => {
  const store = await headers();
  return store.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
};

export const limitByClient = async (scope: string, limit: number, windowMs: number) => {
  enforceRateLimit(`${scope}:${await clientIdentifier()}`, limit, windowMs);
};
