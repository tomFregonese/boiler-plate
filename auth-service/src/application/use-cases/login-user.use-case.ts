import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import type { IPasswordHasher } from '../../domain/adapters/password-hasher.interface';
import { User } from '../../domain/entities/user.entity';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class LoginUserUseCase {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository, @Inject('IPasswordHasher') private readonly passwordHasher: IPasswordHasher) {}

  async execute(dto: LoginUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('User account is inactive');

    const isPasswordValid = await this.passwordHasher.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return user.withoutPassword();
  }
}
