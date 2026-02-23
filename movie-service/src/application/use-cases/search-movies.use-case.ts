import { Inject, Injectable } from '@nestjs/common';
import type {
  MovieSearchResult,
  OmdbMovie,
} from '../../domain/entities/movie.entity';
import {
  MOVIE_REPOSITORY,
  type MovieRepository,
} from '../../domain/repositories/movie.repository';
import { SearchMovieQuery } from '../dto/search-movie.dto';

@Injectable()
export class SearchMoviesUseCase {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: MovieRepository,
  ) {}

  async execute(query: SearchMovieQuery): Promise<MovieSearchResult> {
    const searchTerm = query.q?.trim() || 'movie';
    const page = this.parsePage(query.page);
    const includeDetails =
      this.parseBoolean(query.includeDetails) ||
      this.needsDetailsForFilters(query);
    const filters = this.parseFilters(query);
    const filtersApplied = this.listAppliedFilters(filters);

    const searchResponse = await this.movieRepository.search({
      query: searchTerm,
      type: query.type,
      year: query.year,
      page,
    });

    if (searchResponse.Response === 'False' || !searchResponse.Search) {
      return {
        page,
        totalResults: 0,
        results: [],
        filtersApplied,
      };
    }

    if (!includeDetails) {
      return {
        page,
        totalResults: Number(searchResponse.totalResults ?? 0),
        results: searchResponse.Search,
        filtersApplied,
      };
    }

    const detailedResults = await Promise.all(
      searchResponse.Search.map((item) =>
        this.movieRepository.getById(item.imdbID, query.plot),
      ),
    );
    const filteredResults = detailedResults.filter((movie) =>
      this.matchesFilters(movie, filters),
    );

    return {
      page,
      totalResults: filteredResults.length,
      results: filteredResults,
      filtersApplied,
    };
  }

  private parsePage(value?: string): number {
    const parsed = Number(value);
    if (!value || Number.isNaN(parsed)) {
      return 1;
    }
    return Math.min(Math.max(Math.trunc(parsed), 1), 100);
  }

  private parseBoolean(value?: string): boolean {
    return value?.toLowerCase() === 'true';
  }

  private parseFilters(query: SearchMovieQuery) {
    const releasedFrom = this.parseDate(query.releasedFrom, false);
    const releasedTo = this.parseDate(query.releasedTo, true);
    const releasedOn = this.parseDate(query.releasedOn, false);

    return {
      genre: this.parseList(query.genre),
      releasedFrom: releasedOn ?? releasedFrom,
      releasedTo: releasedOn
        ? this.parseDate(query.releasedOn, true)
        : releasedTo,
      minImdbRating: this.parseNumber(query.minImdbRating),
      maxImdbRating: this.parseNumber(query.maxImdbRating),
      minRuntime: this.parseNumber(query.minRuntime),
      maxRuntime: this.parseNumber(query.maxRuntime),
      director: query.director?.trim().toLowerCase(),
      actor: query.actor?.trim().toLowerCase(),
      language: query.language?.trim().toLowerCase(),
      country: query.country?.trim().toLowerCase(),
    };
  }

  private listAppliedFilters(
    filters: ReturnType<SearchMoviesUseCase['parseFilters']>,
  ) {
    const applied: string[] = [];
    if (filters.genre?.length) applied.push('genre');
    if (filters.releasedFrom) applied.push('releasedFrom');
    if (filters.releasedTo) applied.push('releasedTo');
    if (filters.minImdbRating !== undefined) applied.push('minImdbRating');
    if (filters.maxImdbRating !== undefined) applied.push('maxImdbRating');
    if (filters.minRuntime !== undefined) applied.push('minRuntime');
    if (filters.maxRuntime !== undefined) applied.push('maxRuntime');
    if (filters.director) applied.push('director');
    if (filters.actor) applied.push('actor');
    if (filters.language) applied.push('language');
    if (filters.country) applied.push('country');
    return applied.length ? applied : undefined;
  }

  private needsDetailsForFilters(query: SearchMovieQuery): boolean {
    return Boolean(
      query.genre ||
      query.releasedFrom ||
      query.releasedTo ||
      query.releasedOn ||
      query.minImdbRating ||
      query.maxImdbRating ||
      query.minRuntime ||
      query.maxRuntime ||
      query.director ||
      query.actor ||
      query.language ||
      query.country,
    );
  }

  private matchesFilters(
    movie: OmdbMovie,
    filters: ReturnType<SearchMoviesUseCase['parseFilters']>,
  ): boolean {
    if (movie.Response === 'False') {
      return false;
    }

    if (filters.genre?.length) {
      const movieGenres = this.parseList(movie.Genre) ?? [];
      const matches = filters.genre.some((genre) =>
        movieGenres.includes(genre),
      );
      if (!matches) return false;
    }

    if (filters.releasedFrom || filters.releasedTo) {
      const releasedDate = this.parseDate(movie.Released, false);
      if (!releasedDate) return false;
      if (filters.releasedFrom && releasedDate < filters.releasedFrom) {
        return false;
      }
      if (filters.releasedTo && releasedDate > filters.releasedTo) {
        return false;
      }
    }

    if (filters.minImdbRating !== undefined) {
      const rating = this.parseNumber(movie.imdbRating);
      if (rating === undefined || rating < filters.minImdbRating) {
        return false;
      }
    }

    if (filters.maxImdbRating !== undefined) {
      const rating = this.parseNumber(movie.imdbRating);
      if (rating === undefined || rating > filters.maxImdbRating) {
        return false;
      }
    }

    if (filters.minRuntime !== undefined || filters.maxRuntime !== undefined) {
      const runtime = this.parseRuntime(movie.Runtime);
      if (runtime === undefined) return false;
      if (filters.minRuntime !== undefined && runtime < filters.minRuntime) {
        return false;
      }
      if (filters.maxRuntime !== undefined && runtime > filters.maxRuntime) {
        return false;
      }
    }

    if (filters.director) {
      const director = movie.Director.toLowerCase();
      if (!director.includes(filters.director)) return false;
    }

    if (filters.actor) {
      const actors = movie.Actors.toLowerCase();
      if (!actors.includes(filters.actor)) return false;
    }

    if (filters.language) {
      const language = movie.Language.toLowerCase();
      if (!language.includes(filters.language)) return false;
    }

    if (filters.country) {
      const country = movie.Country.toLowerCase();
      if (!country.includes(filters.country)) return false;
    }

    return true;
  }

  private parseList(value?: string): string[] | undefined {
    if (!value) return undefined;
    return value
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  private parseNumber(value?: string): number | undefined {
    if (!value) return undefined;
    const parsed = Number(value.toString().replace(/,/g, ''));
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private parseRuntime(value?: string): number | undefined {
    if (!value) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private parseDate(value?: string, isEnd = false): Date | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (/^\d{4}$/.test(trimmed)) {
      return new Date(`${trimmed}-${isEnd ? '12-31' : '01-01'}`);
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }
    return parsed;
  }
}
