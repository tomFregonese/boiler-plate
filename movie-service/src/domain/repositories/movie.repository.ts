import type { OmdbMovie, OmdbSearchResponse } from '../entities/movie.entity';

export const MOVIE_REPOSITORY = Symbol('MOVIE_REPOSITORY');

export interface MovieRepository {
  search(params: {
    query: string;
    type?: string;
    year?: string;
    page: number;
  }): Promise<OmdbSearchResponse>;
  getById(omdbId: string, plot?: 'short' | 'full'): Promise<OmdbMovie>;
}
