import { Injectable } from '@nestjs/common';
import type { OmdbMovie, OmdbSearchResponse } from '../../domain/entities/movie.entity';
import type { MovieRepository } from '../../domain/repositories/movie.repository';
import { OmdbClient } from '../http/omdb.client';

@Injectable()
export class OmdbMovieRepository implements MovieRepository {
  constructor(private readonly omdbClient: OmdbClient) {}

  search(params: {
    query: string;
    type?: string;
    year?: string;
    page: number;
  }): Promise<OmdbSearchResponse> {
    return this.omdbClient.request<OmdbSearchResponse>({
      s: params.query,
      type: params.type,
      y: params.year,
      page: params.page,
    });
  }

  getById(imdbId: string, plot?: 'short' | 'full'): Promise<OmdbMovie> {
    return this.omdbClient.request<OmdbMovie>({
      i: imdbId,
      plot,
    });
  }
}
