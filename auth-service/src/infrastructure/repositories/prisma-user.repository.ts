import { Injectable } from '@nestjs/common';
import { IUserRepository, UserUpdateData } from '../../domain/repositories/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: {
        login: user.login,
        password: user.password,
        roles: user.roles,
        status: user.status,
      },
    });

    return this.toDomain(prismaUser);
  }

  async findByLogin(login: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!prismaUser) return null;
    return this.toDomain(prismaUser);
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) return null;
    return this.toDomain(prismaUser);
  }

  async update(
    id: string,
    data: UserUpdateData,
  ): Promise<User> {
    const prismaUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.toDomain(prismaUser);
  }

  private toDomain(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.login,
      prismaUser.password,
      prismaUser.roles,
      prismaUser.status,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
}

