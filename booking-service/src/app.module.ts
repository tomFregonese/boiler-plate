import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { BookingModule } from './booking.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, BookingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
