import { z } from 'zod';

/**
 * Validated environment configuration.
 * Fails fast at boot if required env vars are missing.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_SOCKET_URL: z.string().url().optional(),
});

function createEnv() {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return Object.freeze(parsed.data);
}

export const env = createEnv();
