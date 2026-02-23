import { Module } from '@nestjs/common';
import { JwtAuthMiddleware } from './jwt-auth.middleware.js';
import { AdminGuardMiddleware } from './admin-guard.middleware.js';

@Module({
  providers: [JwtAuthMiddleware, AdminGuardMiddleware],
  exports: [JwtAuthMiddleware, AdminGuardMiddleware],
})
export class AuthModule {}
