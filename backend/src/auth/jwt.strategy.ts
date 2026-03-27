import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { getEnv } from '../config/env';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { AUTH_COOKIE_NAME } from './auth-cookie';

function extractJwtFromCookie(req: Request): string | null {
  const rawCookies: unknown = req.cookies;
  if (typeof rawCookies !== 'object' || rawCookies === null) {
    return null;
  }

  const token = (rawCookies as Record<string, unknown>)[AUTH_COOKIE_NAME];
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    const env = getEnv();
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
  }): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'Your session is no longer valid. Please log in again.',
      );
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
