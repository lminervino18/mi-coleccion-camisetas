import type { PublicProfile, Shirt, UserProfile } from '@camisetas/contracts';
import type { AuthenticatedUser, ShirtRecord } from '@camisetas/core';
import { thumbnailKeyFor } from './images';
import { publicImageUrl } from './storage-url';

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
  bio: user.bio,
  favoriteClub: user.favoriteClub,
  country: user.country,
  collectingSince: user.collectingSince,
  createdAt: user.createdAt.toISOString(),
});

export const toPublicProfile = (user: {
  username: string;
  displayName: string | null;
  avatarKey: string | null;
  bio: string | null;
  favoriteClub: string | null;
  country: string | null;
  collectingSince: number | null;
}): PublicProfile => ({
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatarKey === null ? null : publicImageUrl(user.avatarKey),
  bio: user.bio,
  favoriteClub: user.favoriteClub,
  country: user.country,
  collectingSince: user.collectingSince,
});

/** Note the absence of userId: the owner is never part of the shirt contract. */
export const toShirt = (shirt: ShirtRecord): Shirt => ({
  id: shirt.id,
  kind: shirt.kind,
  club: shirt.club,
  league: shirt.league,
  country: shirt.country,
  season: shirt.season,
  kit: shirt.kit,
  size: shirt.size,
  playerName: shirt.playerName,
  squadNumber: shirt.squadNumber,
  colors: shirt.colors,
  notes: shirt.notes,
  isFavorite: shirt.isFavorite,
  image: {
    thumbnailUrl: publicImageUrl(thumbnailKeyFor(shirt.imageKey)),
    fullUrl: publicImageUrl(shirt.imageKey),
    width: shirt.imageWidth,
    height: shirt.imageHeight,
  },
  createdAt: shirt.createdAt.toISOString(),
  updatedAt: shirt.updatedAt.toISOString(),
});
