import { and, eq, ne, sql } from 'drizzle-orm';
import type { Database } from '@camisetas/db';
import { schema } from '@camisetas/db';
import type { RegisterInput, UpdateProfileInput } from '@camisetas/contracts';
import { hashPassword, verifyPassword } from './passwords';
import { conflict, notFound, unauthenticated } from './errors';
import type { AuthenticatedUser } from './sessions';

const byUsernameInsensitive = (username: string) =>
  sql`lower(${schema.users.username}) = lower(${username})`;

/** Parenthesised so the OR keeps its own scope when combined with other conditions. */
const matchesUsernameOrEmail = (username: string, email: string) =>
  sql`(lower(${schema.users.username}) = lower(${username}) OR ${schema.users.email} = ${email})`;

export const registerUser = async (
  db: Database,
  input: RegisterInput,
): Promise<AuthenticatedUser> => {
  const [existing] = await db
    .select({ username: schema.users.username, email: schema.users.email })
    .from(schema.users)
    .where(matchesUsernameOrEmail(input.username, input.email))
    .limit(1);

  if (existing !== undefined) {
    const fieldErrors: Record<string, string[]> = {};
    if (existing.username.toLowerCase() === input.username.toLowerCase()) {
      fieldErrors['username'] = ['Ese nombre de usuario ya está en uso.'];
    }
    if (existing.email === input.email) {
      fieldErrors['email'] = ['Ese correo ya está registrado.'];
    }
    throw conflict('No pudimos crear la cuenta.', fieldErrors);
  }

  const [user] = await db
    .insert(schema.users)
    .values({
      username: input.username,
      email: input.email,
      passwordHash: await hashPassword(input.password),
    })
    .returning({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      displayName: schema.users.displayName,
      avatarKey: schema.users.avatarKey,
      createdAt: schema.users.createdAt,
    });

  if (user === undefined) throw new Error('Insert returned no row.');
  return user;
};

/**
 * Verifies the password before returning the user. A missing account still runs a hash
 * comparison so that response time does not reveal whether the username exists.
 */
export const authenticate = async (
  db: Database,
  username: string,
  password: string,
): Promise<AuthenticatedUser> => {
  const [row] = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      displayName: schema.users.displayName,
      avatarKey: schema.users.avatarKey,
      createdAt: schema.users.createdAt,
      passwordHash: schema.users.passwordHash,
    })
    .from(schema.users)
    .where(byUsernameInsensitive(username))
    .limit(1);

  const storedHash = row?.passwordHash ?? DUMMY_HASH;
  const matches = await verifyPassword(storedHash, password);

  if (row === undefined || !matches) {
    throw unauthenticated('Usuario o contraseña incorrectos.');
  }

  const { passwordHash: _passwordHash, ...user } = row;
  return user;
};

/** Argon2id hash of a value no user can produce, used to equalise timing on unknown usernames. */
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$EEccC8FvY+aQ3P0qAqH3lw$99HCj8mn2UPxyfXUfoCXHpEhOcUx2Tvw0WP1UeyKxVM';

export const changePassword = async (
  db: Database,
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const [row] = await db
    .select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (row === undefined) throw notFound('No encontramos tu cuenta.');
  if (!(await verifyPassword(row.passwordHash, currentPassword))) {
    throw unauthenticated('La contraseña actual no es correcta.');
  }

  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(schema.users.id, userId));
};

export const updateProfile = async (
  db: Database,
  userId: string,
  input: UpdateProfileInput,
): Promise<AuthenticatedUser> => {
  const [taken] = await db
    .select({ username: schema.users.username, email: schema.users.email })
    .from(schema.users)
    .where(
      and(ne(schema.users.id, userId), matchesUsernameOrEmail(input.username, input.email)),
    )
    .limit(1);

  if (taken !== undefined) {
    const fieldErrors: Record<string, string[]> = {};
    if (taken.username.toLowerCase() === input.username.toLowerCase()) {
      fieldErrors['username'] = ['Ese nombre de usuario ya está en uso.'];
    }
    if (taken.email === input.email) {
      fieldErrors['email'] = ['Ese correo ya está registrado.'];
    }
    throw conflict('No pudimos guardar el perfil.', fieldErrors);
  }

  const [user] = await db
    .update(schema.users)
    .set({
      username: input.username,
      email: input.email,
      displayName: input.displayName,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId))
    .returning({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      displayName: schema.users.displayName,
      avatarKey: schema.users.avatarKey,
      createdAt: schema.users.createdAt,
    });

  if (user === undefined) throw notFound('No encontramos tu cuenta.');
  return user;
};

export const deleteAccount = async (
  db: Database,
  userId: string,
  password: string,
): Promise<void> => {
  const [row] = await db
    .select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (row === undefined) throw notFound('No encontramos tu cuenta.');
  if (!(await verifyPassword(row.passwordHash, password))) {
    throw unauthenticated('La contraseña no es correcta.');
  }

  await db.delete(schema.users).where(eq(schema.users.id, userId));
};
