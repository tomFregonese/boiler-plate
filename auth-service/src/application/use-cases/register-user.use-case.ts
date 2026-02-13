import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import type { IPasswordHasher } from '../../domain/adapters/password-hasher.interface';
import { User } from '../../domain/entities/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository, @Inject('IPasswordHasher') private readonly passwordHasher: IPasswordHasher,) {}

  async execute(dto: RegisterUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await this.passwordHasher.hash(dto.password);

    const user = User.create(
      dto.email,
      hashedPassword,
      dto.firstName,
      dto.lastName,
      dto.role,
      dto.cinemaId,
    );

    const savedUser = await this.userRepository.save(user);

    return savedUser.withoutPassword();
  }
}
