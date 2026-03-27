import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '../generated/prisma/client.js';
import { hash, verify } from '@node-rs/argon2';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './auth.schemas';
import type { Response } from 'express';
import { clearAuthCookie, setAuthCookie } from './auth-cookie';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hash(dto.password);
    try {
      const user = await this.usersService.create({
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      });

      const token = await this.signToken(user.id, user.email);
      return { user: this.sanitizeUser(user), token };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await verify(user.password, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.signToken(user.id, user.email);
    return { user: this.sanitizeUser(user), token };
  }

  setTokenCookie(res: Response, token: string) {
    setAuthCookie(res, token);
  }

  clearTokenCookie(res: Response) {
    clearAuthCookie(res);
  }

  private async signToken(userId: string, email: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, email });
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
