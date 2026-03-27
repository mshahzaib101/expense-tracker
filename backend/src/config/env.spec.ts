import { durationToMilliseconds, getEnv, resetEnvCache } from './env';

const ORIGINAL_ENV = process.env;

describe('env', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    resetEnvCache();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    resetEnvCache();
  });

  it('parses required environment variables', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_SECRET = '12345678901234567890123456789012';
    process.env.JWT_EXPIRATION = '7d';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    delete process.env.PORT;
    delete process.env.NODE_ENV;

    expect(getEnv()).toEqual({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      FRONTEND_URL: 'http://localhost:3000',
      JWT_EXPIRATION: '7d',
      JWT_SECRET: '12345678901234567890123456789012',
      NODE_ENV: 'development',
      PORT: 3001,
    });
  });

  it('rejects a weak JWT secret', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.JWT_SECRET = 'too-short';
    process.env.JWT_EXPIRATION = '7d';
    process.env.FRONTEND_URL = 'http://localhost:3000';

    expect(() => getEnv()).toThrow(
      'JWT_SECRET must be at least 32 characters long',
    );
  });

  it('converts JWT expiration values to milliseconds', () => {
    expect(durationToMilliseconds('15m')).toBe(15 * 60 * 1000);
    expect(durationToMilliseconds('12h')).toBe(12 * 60 * 60 * 1000);
    expect(durationToMilliseconds('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
