import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Prisma } from '../../generated/prisma/client.js';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong. Please try again later.';
    let errors: unknown = undefined;

    if (exception instanceof ThrottlerException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message =
        'Slow down — too many requests. Please wait a moment and try again.';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      ({ status, message } = this.handlePrismaError(exception));
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error(
        `Database connection failed: ${(exception as Error).message}`,
      );
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message =
        'Service temporarily unavailable. Please try again in a moment.';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        const respMessage = resp.message;
        if (Array.isArray(respMessage)) {
          message = respMessage.join('. ');
        } else if (typeof respMessage === 'string') {
          message = respMessage;
        }
        errors = resp.errors;
      }
    } else {
      this.logger.error('Unhandled exception', exception as Error);
    }

    response.status(status).json({
      statusCode: status,
      message,
      ...(errors ? { errors } : {}),
    });
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (error.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with this information already exists.',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found.',
        };
      default:
        this.logger.error(`Prisma error: ${error.code} ${error.message}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong. Please try again later.',
        };
    }
  }
}
