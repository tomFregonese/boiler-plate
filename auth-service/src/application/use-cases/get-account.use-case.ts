import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GetAccountUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(uid: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(uid);
    if (!user) throw new NotFoundException('User not found');

    return user.withoutPassword();
  }
}

