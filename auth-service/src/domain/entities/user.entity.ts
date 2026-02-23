export class User {
  constructor(
    public readonly id: string,
    public readonly login: string,
    public readonly password: string,
    public readonly roles: string[],
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    login: string,
    password: string,
    roles: string[] = ['ROLE_USER'],
    status: string = 'open',
  ): User {
    return new User(
      '',
      login,
      password,
      roles,
      status,
      new Date(),
      new Date(),
    );
  }

  withoutPassword(): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword as Omit<User, 'password'>;
  }
}


