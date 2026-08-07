import { z } from 'zod';

/**
 * Every preview deployment gets its own hostname, so falling back to the one the platform
 * injects keeps share links and reset emails pointing at the deployment that produced them
 * instead of at production.
 */
const inferredAppUrl =
  process.env['VERCEL_URL'] === undefined ? undefined : `https://${process.env['VERCEL_URL']}`;

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL de conexión válida.'),
  APP_URL: z
    .string()
    .url('APP_URL debe ser la URL pública de la aplicación.')
    .default(inferredAppUrl ?? ''),
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET: z.string().min(1).optional(),
  R2_PUBLIC_URL: z.string().url().optional(),
  BREVO_API_KEY: z.string().min(1).optional(),
  MAIL_FROM: z.string().email().default('no-reply@micoleccion.app'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Configuración inválida:\n${details}`);
}

export const env: ServerEnv = parsed.data;

export const isProduction = env.NODE_ENV === 'production';

/** Storage and mail fall back to local stubs while their credentials are absent. */
export const hasObjectStorage =
  env.R2_ACCOUNT_ID !== undefined &&
  env.R2_ACCESS_KEY_ID !== undefined &&
  env.R2_SECRET_ACCESS_KEY !== undefined &&
  env.R2_BUCKET !== undefined;

export const hasMailProvider = env.BREVO_API_KEY !== undefined;
