import { RefreshToken } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  save(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

