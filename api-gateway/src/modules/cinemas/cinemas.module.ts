import { Module } from '@nestjs/common';
import { CinemasAdapter } from './cinemas.adapter.js';
import { CinemasController } from './cinemas.controller.js';

@Module({
  controllers: [CinemasController],
  providers: [CinemasAdapter],
})
export class CinemasModule {}
