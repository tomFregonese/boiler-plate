export class RefreshToken {
  constructor(
    public readonly id: string,
    public readonly token: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(token: string, userId: string, expiresAt: Date): RefreshToken {
    return new RefreshToken('', token, userId, expiresAt, new Date());
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }
}

