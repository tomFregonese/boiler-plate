import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { OmdbMovie } from '../../domain/entities/movie.entity';
import {
  MOVIE_REPOSITORY,
  type MovieRepository,
} from '../../domain/repositories/movie.repository';

@Injectable()
export class GetMovieByIdUseCase {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: MovieRepository,
  ) {}

  async execute(imdbId: string, plot?: 'short' | 'full'): Promise<OmdbMovie> {
    const response = await this.movieRepository.getById(imdbId, plot);
    if (response.Response === 'False') {
      throw new BadRequestException(response.Error ?? 'Movie not found.');
    }
    return response;
  }
}
