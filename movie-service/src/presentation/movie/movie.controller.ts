import {
  Controller,
  Get,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Param,
  Query,
} from '@nestjs/common';
import { SearchMoviesUseCase } from '../../application/use-cases/search-movies.use-case';
import { GetMovieByIdUseCase } from '../../application/use-cases/get-movie-by-id.use-case';
import type { SearchMovieQuery } from '../../application/dto/search-movie.dto';

@Controller('movie')
export class MovieController {
  constructor(
    private readonly searchMoviesUseCase: SearchMoviesUseCase,
    private readonly getMovieByIdUseCase: GetMovieByIdUseCase,
  ) {}

  @Get()
  async findAll(@Query() query: SearchMovieQuery) {
    try {
      return await this.searchMoviesUseCase.execute(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('title/:title')
  async findByTitle(
    @Param('title') title: string,
    @Query() query: SearchMovieQuery,
  ) {
    try {
      return await this.searchMoviesUseCase.execute({ ...query, q: title });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('title/:title/page/:page')
  async findByTitlePage(
    @Param('title') title: string,
    @Param('page') page: string,
    @Query() query: SearchMovieQuery,
  ) {
    try {
      if (title.trim() === '') {
        throw new BadRequestException('title cannot be empty');
      }
      if (!/^\d+$/.test(page) || Number(page) < 1) {
        throw new BadRequestException('page must be a positive integer');
      }
      return await this.searchMoviesUseCase.execute({
        ...query,
        q: title,
        page,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('id/:imdbId')
  async findByImdbId(
    @Param('imdbId') imdbId: string,
    @Query('plot') plot?: 'short' | 'full',
  ) {
    try {
      if (!/^tt\d{7,10}$/.test(imdbId)) {
        throw new BadRequestException('imdbId must match format tt1234567');
      }
      if (plot && plot !== 'short' && plot !== 'full') {
        throw new BadRequestException('plot must be short or full');
      }
      return await this.getMovieByIdUseCase.execute(imdbId, plot);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('genre/:genre')
  async findByGenre(
    @Param('genre') genre: string,
    @Query() query: SearchMovieQuery,
  ) {
    try {
      return await this.searchMoviesUseCase.execute({
        ...query,
        q: query.q ?? genre,
        genre,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('release/:date')
  async findByReleaseDate(
    @Param('date') date: string,
    @Query() query: SearchMovieQuery,
  ) {
    try {
      return await this.searchMoviesUseCase.execute({
        ...query,
        q: query.q ?? 'movie',
        releasedOn: date,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException('Unexpected error');
  }
}
