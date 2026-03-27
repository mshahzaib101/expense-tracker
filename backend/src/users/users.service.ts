import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: { email: string; name: string; password: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        password: data.password,
      },
    });
  }

  async updateName(id: string, name: string) {
    return this.prisma.user.update({
      where: { id },
      data: { name },
    });
  }

  async updatePassword(id: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordValid = await verify(user.password, currentPassword);
    if (!passwordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const hashedPassword = await hash(newPassword);
    await this.updatePassword(id, hashedPassword);
  }

  async deleteAccountWithPassword(id: string, password: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordValid = await verify(user.password, password);
    if (!passwordValid) {
      throw new ForbiddenException('Password is incorrect');
    }

    await this.deleteAccount(id);
  }

  async deleteAccount(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
