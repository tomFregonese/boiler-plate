import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import type { IPasswordHasher } from '../../domain/adapters/password-hasher.interface';
import { User } from '../../domain/entities/user.entity';
import { UpdateAccountDto } from '../dto/update-account.dto';

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher') private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(uid: string, dto: UpdateAccountDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(uid);
    if (!user) throw new NotFoundException('User not found');

    // Check login uniqueness if changing login
    if (dto.login && dto.login !== user.login) {
      const existing = await this.userRepository.findByLogin(dto.login);
      if (existing) throw new ConflictException('Login already exists');
    }

    const updateData: { login?: string; password?: string; roles?: string[]; status?: string } = {};

    if (dto.login !== undefined) updateData.login = dto.login;
    if (dto.roles !== undefined) updateData.roles = dto.roles;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.password !== undefined) {
      updateData.password = await this.passwordHasher.hash(dto.password);
    }

    const updatedUser = await this.userRepository.update(uid, updateData);
    return updatedUser.withoutPassword();
  }
}


