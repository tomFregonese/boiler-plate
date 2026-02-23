import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';
import { GetAccountUseCase } from './application/use-cases/get-account.use-case';
import { UpdateAccountUseCase } from './application/use-cases/update-account.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/repositories/prisma-refresh-token.repository';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [
    // Use Cases
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    ValidateTokenUseCase,
    GetAccountUseCase,
    UpdateAccountUseCase,

    // Infrastructure
    PrismaService,

    // Dependency Injection via interfaces
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IRefreshTokenRepository',
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: 'IPasswordHasher',
      useClass: BcryptPasswordService,
    },
    {
      provide: 'ITokenService',
      useClass: JwtTokenService,
    },
  ],
})
export class AuthModule {}


