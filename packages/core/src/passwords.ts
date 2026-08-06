import { hash, verify } from '@node-rs/argon2';

/** OWASP-recommended Argon2id parameters: 19 MiB memory, 2 iterations, 1 degree of parallelism. */
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const hashPassword = (password: string): Promise<string> => hash(password, ARGON2_OPTIONS);

/**
 * Returns false instead of throwing when the stored hash is malformed, so a corrupt row
 * cannot turn into a 500 that distinguishes it from a wrong password.
 */
export const verifyPassword = async (hashed: string, password: string): Promise<boolean> => {
  try {
    return await verify(hashed, password);
  } catch {
    return false;
  }
};
