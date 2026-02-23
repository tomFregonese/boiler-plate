import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import type { ITokenService } from '../../domain/adapters/token-service.interface';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token-repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('ITokenService') private readonly tokenService: ITokenService,
    @Inject('IRefreshTokenRepository') private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(rawRefreshToken: string): Promise<TokenPairResponse> {
    const existing = await this.refreshTokenRepository.findByToken(rawRefreshToken);
    if (!existing) throw new UnauthorizedException('Invalid refresh token');

    if (existing.isExpired()) {
      await this.refreshTokenRepository.deleteByToken(rawRefreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.userRepository.findById(existing.userId);
    if (!user) throw new UnauthorizedException('User not found');

    if (user.status !== 'open') throw new UnauthorizedException('Account is not active');

    // Rotate refresh token
    await this.refreshTokenRepository.deleteByToken(rawRefreshToken);

    const accessToken = this.tokenService.generateAccessToken({
      uid: user.id,
      login: user.login,
      roles: user.roles,
    });

    const newRawRefreshToken = this.tokenService.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newRefreshToken = RefreshToken.create(newRawRefreshToken, user.id, expiresAt);
    await this.refreshTokenRepository.save(newRefreshToken);

    return { accessToken, refreshToken: newRawRefreshToken };
  }
}

