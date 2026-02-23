import { Injectable } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token-repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    const prismaToken = await this.prisma.refreshToken.create({
      data: {
        token: refreshToken.token,
        userId: refreshToken.userId,
        expiresAt: refreshToken.expiresAt,
      },
    });

    return this.toDomain(prismaToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const prismaToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!prismaToken) return null;
    return this.toDomain(prismaToken);
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { token } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  private toDomain(prismaToken: any): RefreshToken {
    return new RefreshToken(
      prismaToken.id,
      prismaToken.token,
      prismaToken.userId,
      prismaToken.expiresAt,
      prismaToken.createdAt,
    );
  }
}

