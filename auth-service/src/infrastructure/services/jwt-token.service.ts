import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { ITokenService, JwtPayload } from '../../domain/adapters/token-service.interface';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly jwtSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
  }

  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload as object, this.jwtSecret, { expiresIn: '60m' } as jwt.SignOptions);
  }

  generateRefreshToken(): string {
    return randomUUID();
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload & { iat: number; exp: number };
      return { uid: decoded.uid, login: decoded.login, roles: decoded.roles };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}


