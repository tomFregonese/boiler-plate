import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './infrastructure/database/prisma.module'
import { BookingModule } from './booking.module'
import { InternalAuthMiddleware } from './presentation/middlewares/internal-auth.middleware'

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, BookingModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InternalAuthMiddleware).forRoutes('*')
  }
}
