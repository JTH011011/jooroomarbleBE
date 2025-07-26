// src/auth/auth.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(dto: SignupDto, passwordHash: string) {
    return await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        nickname: dto.nickname,
      },
    });
  }
}
