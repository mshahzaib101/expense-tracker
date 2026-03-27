import {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  setAuthCookie,
} from './auth-cookie';
import { resetEnvCache } from '../config/env';

const ORIGINAL_ENV = process.env;

describe('auth-cookie', () => {
  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: '12345678901234567890123456789012',
      JWT_EXPIRATION: '7d',
      FRONTEND_URL: 'http://localhost:3000',
      NODE_ENV: 'production',
    };
    resetEnvCache();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    resetEnvCache();
  });

  it('sets a secure auth cookie with maxAge derived from JWT expiration', () => {
    const response = {
      cookie: jest.fn(),
    };

    setAuthCookie(response as never, 'token-value');

    expect(response.cookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      'token-value',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
  });

  it('clears the auth cookie with the same base options', () => {
    const response = {
      clearCookie: jest.fn(),
    };

    clearAuthCookie(response as never);

    expect(response.clearCookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });
});
