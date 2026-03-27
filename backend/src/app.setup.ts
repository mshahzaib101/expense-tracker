import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { getEnv } from './config/env';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function isTrustedRequestOrigin(frontendUrl: string, req: Request): boolean {
  const trustedOrigin = new URL(frontendUrl).origin;
  const origin = req.get('origin');
  const referer = req.get('referer');

  if (origin) {
    return origin === trustedOrigin;
  }

  if (referer) {
    try {
      return new URL(referer).origin === trustedOrigin;
    } catch {
      return false;
    }
  }

  return true;
}

export function configureApp(app: INestApplication) {
  const env = getEnv();

  app.use(cookieParser());
  app.use(helmet());

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!STATE_CHANGING_METHODS.has(req.method)) {
      return next();
    }

    if (isTrustedRequestOrigin(env.FRONTEND_URL, req)) {
      return next();
    }

    res.status(HttpStatus.FORBIDDEN).json({
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Request origin is not allowed.',
    });
  });

  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
}
