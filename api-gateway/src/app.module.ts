import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { JwtAuthMiddleware } from './auth/jwt-auth.middleware.js';
import { AdminGuardMiddleware } from './auth/admin-guard.middleware.js';
import { HeadersInjectionMiddleware } from './common/middlewares/headers-injection.middleware.js';
import { MoviesModule } from './modules/movies/movies.module.js';
import { AuthProxyModule } from './modules/auth/auth-proxy.module.js';
import { CinemasModule } from './modules/cinemas/cinemas.module.js';
import {BookingModule} from "./modules/booking/booking.module";

@Module({
  imports: [AuthModule, HealthModule, MoviesModule, AuthProxyModule, CinemasModule, BookingModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(JwtAuthMiddleware, AdminGuardMiddleware, HeadersInjectionMiddleware)
      .forRoutes('*');
  }
}
