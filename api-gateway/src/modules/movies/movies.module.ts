import { Module } from '@nestjs/common';
import { MoviesAdapter } from './movies.adapter.js';
import { MoviesController } from './movies.controller.js';

@Module({
  controllers: [MoviesController],
  providers: [MoviesAdapter],
})
export class MoviesModule {}
