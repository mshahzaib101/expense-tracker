import type { CookieOptions, Response } from 'express';
import { durationToMilliseconds, getEnv } from '../config/env';

export const AUTH_COOKIE_NAME = 'token';

function getBaseCookieOptions(): CookieOptions {
  const env = getEnv();
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string) {
  const env = getEnv();

  res.cookie(AUTH_COOKIE_NAME, token, {
    ...getBaseCookieOptions(),
    maxAge: durationToMilliseconds(env.JWT_EXPIRATION),
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, getBaseCookieOptions());
}
