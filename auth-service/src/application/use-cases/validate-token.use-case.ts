import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { ITokenService, JwtPayload } from '../../domain/adapters/token-service.interface';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject('ITokenService') private readonly tokenService: ITokenService,
  ) {}

  execute(accessToken: string): JwtPayload {
    try {
      return this.tokenService.verifyAccessToken(accessToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

