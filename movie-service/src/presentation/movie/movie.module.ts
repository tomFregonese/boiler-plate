import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { SearchMoviesUseCase } from '../../application/use-cases/search-movies.use-case';
import { GetMovieByIdUseCase } from '../../application/use-cases/get-movie-by-id.use-case';
import { MOVIE_REPOSITORY } from '../../domain/repositories/movie.repository';
import { OmdbClient } from '../../infrastructure/http/omdb.client';
import { OmdbMovieRepository } from '../../infrastructure/repositories/omdb-movie.repository';

@Module({
  controllers: [MovieController],
  providers: [
    SearchMoviesUseCase,
    GetMovieByIdUseCase,
    OmdbClient,
    {
      provide: MOVIE_REPOSITORY,
      useClass: OmdbMovieRepository,
    },
  ],
})
export class MovieModule {}
