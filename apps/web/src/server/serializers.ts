import type { PublicProfile, UserProfile } from '@camisetas/contracts';
import type { AuthenticatedUser } from '@camisetas/core';
import { publicImageUrl } from './storage';

/**
 * Response bodies are built field by field so that adding a column to the users table never
 * leaks it through the API.
 */
export const toUserProfile = (user: AuthenticatedUser): UserProfile => ({
  id: user.id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  avatarUrl: user.avatarKey === null ? null : publicImageUrl(user.avatarKey),
  createdAt: user.createdAt.toISOString(),
});

export const toPublicProfile = (user: {
  username: string;
  displayName: string | null;
  avatarKey: string | null;
}): PublicProfile => ({
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatarKey === null ? null : publicImageUrl(user.avatarKey),
});
