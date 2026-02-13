import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [
    // Use Cases
    RegisterUserUseCase,
    LoginUserUseCase,

    // Infrastructure Services
    PrismaService,

    // Dependency Injection with interfaces
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IPasswordHasher',
      useClass: BcryptPasswordService,
    },
  ],
  exports: [
    'IUserRepository',
    'IPasswordHasher',
  ],
})
export class AuthModule {}
