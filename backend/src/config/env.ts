import { z } from 'zod';

const durationPattern = /^(\d+)(ms|s|m|h|d)$/;

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRATION: z
    .string()
    .regex(
      durationPattern,
      'JWT_EXPIRATION must use a number plus unit, for example 15m, 12h, or 7d',
    ),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  PORT: z.coerce.number().int().positive().default(3001),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  cachedEnv ??= envSchema.parse(process.env);
  return cachedEnv;
}

export function resetEnvCache() {
  cachedEnv = null;
}

export function durationToMilliseconds(value: string): number {
  const match = durationPattern.exec(value);
  if (!match) {
    throw new Error(
      'Invalid duration. Expected a number followed by ms, s, m, h, or d.',
    );
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'ms':
      return amount;
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
  }

  throw new Error('Invalid duration unit.');
}
