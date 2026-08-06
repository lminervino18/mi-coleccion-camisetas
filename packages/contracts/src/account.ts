import { z } from 'zod';

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'El nombre de usuario necesita al menos 3 caracteres.')
  .max(30, 'El nombre de usuario admite hasta 30 caracteres.')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Usá solo letras, números, guiones y guiones bajos.');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Ingresá un correo electrónico válido.')
  .max(254);

/**
 * Length is the dominant strength factor; composition rules are omitted on purpose so that
 * passphrases and symbol-rich passwords are both accepted (OWASP ASVS 2.1).
 */
export const passwordSchema = z
  .string()
  .min(10, 'La contraseña necesita al menos 10 caracteres.')
  .max(200, 'La contraseña admite hasta 200 caracteres.');

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Ingresá tu nombre de usuario.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingresá tu contraseña actual.'),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const requestPasswordResetSchema = z.object({ email: emailSchema });
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  displayName: z
    .string()
    .trim()
    .max(60)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  username: usernameSchema,
  email: emailSchema,
  displayName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

/** Public projection of a profile: never includes email, role or internal identifiers. */
export const publicProfileSchema = z.object({
  username: usernameSchema,
  displayName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
});
export type PublicProfile = z.infer<typeof publicProfileSchema>;
