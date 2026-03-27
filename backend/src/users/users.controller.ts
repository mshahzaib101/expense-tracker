import {
  Controller,
  Patch,
  Delete,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from './users.schemas';
import type {
  UpdateProfileDto,
  ChangePasswordDto,
  DeleteAccountDto,
} from './users.schemas';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { clearAuthCookie } from '../auth/auth-cookie';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

@Controller('users')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { ttl: 60000, limit: 10 } })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  async updateProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateName(currentUser.id, body.name);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    };
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.usersService.changePassword(
      currentUser.id,
      body.currentPassword,
      body.newPassword,
    );

    clearAuthCookie(res);

    return {
      statusCode: HttpStatus.OK,
      message: 'Password changed successfully. Please log in again.',
      data: null,
    };
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(deleteAccountSchema)) body: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.usersService.deleteAccountWithPassword(
      currentUser.id,
      body.password,
    );

    clearAuthCookie(res);

    return {
      statusCode: HttpStatus.OK,
      message: 'Account deleted successfully',
      data: null,
    };
  }
}
