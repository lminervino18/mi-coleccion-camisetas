import { describe, expect, it } from 'vitest';
import { emailSchema, passwordSchema, registerSchema, usernameSchema } from './account';

describe('usernameSchema', () => {
  it.each(['lminervino18', 'a-b_c', 'ABC'])('accepts %s', (username) => {
    expect(usernameSchema.parse(username)).toBe(username);
  });

  it.each(['ab', 'con espacio', 'acentué', 'sql;drop', 'a'.repeat(31)])(
    'rejects %s',
    (username) => {
      expect(usernameSchema.safeParse(username).success).toBe(false);
    },
  );
});

describe('emailSchema', () => {
  it('lowercases and trims', () => {
    expect(emailSchema.parse('  Loren@Example.COM ')).toBe('loren@example.com');
  });

  it.each(['sin-arroba', 'a@', '@b.com', ''])('rejects %s', (email) => {
    expect(emailSchema.safeParse(email).success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('accepts a passphrase with spaces and symbols', () => {
    expect(passwordSchema.safeParse('camiseta del celta 2017!').success).toBe(true);
  });

  it('rejects anything under ten characters', () => {
    expect(passwordSchema.safeParse('corta123').success).toBe(false);
  });

  it('does not require mixed character classes', () => {
    expect(passwordSchema.safeParse('aaaaaaaaaaaa').success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('reports every invalid field at once', () => {
    const result = registerSchema.safeParse({ username: 'a', email: 'x', password: 'y' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(new Set(result.error.issues.map((issue) => issue.path[0]))).toEqual(
        new Set(['username', 'email', 'password']),
      );
    }
  });
});
