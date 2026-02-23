export interface JwtPayload {
  uid: string;
  login: string;
  roles: string[];
}

export interface ITokenService {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(): string;
  verifyAccessToken(token: string): JwtPayload;
}

