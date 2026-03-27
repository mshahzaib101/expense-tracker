import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('auth')
@Throttle({ default: { ttl: 60000, limit: 10 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(
    @Body() body: { name: string; email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.register(body);
    this.authService.setTokenCookie(res, token);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Registration successful',
      data: { user },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.login(body);
    this.authService.setTokenCookie(res, token);
    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: { user },
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearTokenCookie(res);
    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully',
      data: null,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: { user },
    };
  }
}
