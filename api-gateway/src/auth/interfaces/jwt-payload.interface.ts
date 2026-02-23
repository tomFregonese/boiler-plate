export interface JwtPayload {
  uid: string;
  login: string;
  roles: string[];
  iat: number;
  exp: number;
}
