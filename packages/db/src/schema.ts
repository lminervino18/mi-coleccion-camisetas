import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { SHIRT_COLORS, SHIRT_KINDS, SHIRT_KITS, SHIRT_SIZES } from '@camisetas/contracts';

export const shirtKindEnum = pgEnum('shirt_kind', SHIRT_KINDS);
export const shirtKitEnum = pgEnum('shirt_kit', SHIRT_KITS);
export const shirtSizeEnum = pgEnum('shirt_size', SHIRT_SIZES);
export const shirtColorEnum = pgEnum('shirt_color', SHIRT_COLORS);
export const imageUploadStatusEnum = pgEnum('image_upload_status', ['pending', 'confirmed']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    username: text('username').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name'),
    avatarKey: text('avatar_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Usernames are compared case-insensitively so "Loren" and "loren" cannot both exist.
    uniqueIndex('users_username_lower_idx').on(sql`lower(${table.username})`),
    uniqueIndex('users_email_idx').on(table.email),
  ],
);

/**
 * Session ids are stored hashed so that a dump of this table cannot be replayed as a
 * live session cookie.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }).notNull().defaultNow(),
    userAgent: text('user_agent'),
  },
  (table) => [
    uniqueIndex('sessions_token_hash_idx').on(table.tokenHash),
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('password_reset_tokens_hash_idx').on(table.tokenHash),
    index('password_reset_tokens_user_id_idx').on(table.userId),
  ],
);

/**
 * Objects are recorded before the browser uploads them to storage. Rows left pending are
 * orphaned uploads and are swept periodically.
 */
export const imageUploads = pgTable(
  'image_uploads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    objectKey: text('object_key').notNull(),
    contentType: text('content_type').notNull(),
    byteSize: integer('byte_size').notNull(),
    status: imageUploadStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('image_uploads_object_key_idx').on(table.objectKey),
    index('image_uploads_status_created_at_idx').on(table.status, table.createdAt),
  ],
);

export const shirts = pgTable(
  'shirts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: shirtKindEnum('kind').notNull(),
    club: text('club'),
    league: text('league'),
    country: text('country').notNull(),
    season: text('season').notNull(),
    kit: shirtKitEnum('kit').notNull(),
    size: shirtSizeEnum('size').notNull(),
    playerName: text('player_name'),
    squadNumber: smallint('squad_number'),
    notes: text('notes'),
    isFavorite: boolean('is_favorite').notNull().default(false),
    imageKey: text('image_key').notNull(),
    imageWidth: integer('image_width').notNull(),
    imageHeight: integer('image_height').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('shirts_user_id_created_at_idx').on(table.userId, table.createdAt),
    index('shirts_user_id_position_idx').on(table.userId, table.position),
    index('shirts_user_id_country_idx').on(table.userId, table.country),
    index('shirts_user_id_league_idx').on(table.userId, table.league),
  ],
);

export const shirtColors = pgTable(
  'shirt_colors',
  {
    shirtId: uuid('shirt_id')
      .notNull()
      .references(() => shirts.id, { onDelete: 'cascade' }),
    color: shirtColorEnum('color').notNull(),
  },
  (table) => [
    uniqueIndex('shirt_colors_shirt_id_color_idx').on(table.shirtId, table.color),
    index('shirt_colors_color_idx').on(table.color),
  ],
);

/**
 * Share tokens are capabilities: anyone holding one can read the collection. Only the hash is
 * stored, so a leaked dump cannot be turned into working links.
 */
export const shareLinks = pgTable(
  'share_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('share_links_token_hash_idx').on(table.tokenHash),
    index('share_links_user_id_idx').on(table.userId),
  ],
);
