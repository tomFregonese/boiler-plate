import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/database/prisma.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
