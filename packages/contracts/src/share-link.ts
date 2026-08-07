import { z } from 'zod';

export const shareLinkSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
});
export type ShareLink = z.infer<typeof shareLinkSchema>;

export const createShareLinkSchema = z.object({
  expiresInDays: z.number().int().min(1).max(365).nullable(),
});
export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
