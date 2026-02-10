import { Controller, Get, Param, Query } from '@nestjs/common';
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
  findAll(@Query() query: SearchMovieQuery) {
    return this.searchMoviesUseCase.execute(query);
  }

  @Get('title/:title')
  findByTitle(@Param('title') title: string, @Query() query: SearchMovieQuery) {
    return this.searchMoviesUseCase.execute({ ...query, q: title });
  }

  @Get('title/:title/page/:page')
  findByTitlePage(
    @Param('title') title: string,
    @Param('page') page: string,
    @Query() query: SearchMovieQuery,
  ) {
    return this.searchMoviesUseCase.execute({ ...query, q: title, page });
  }

  @Get('id/:imdbId')
  findByImdbId(
    @Param('imdbId') imdbId: string,
    @Query('plot') plot?: 'short' | 'full',
  ) {
    return this.getMovieByIdUseCase.execute(imdbId, plot);
  }

  @Get('genre/:genre')
  findByGenre(@Param('genre') genre: string, @Query() query: SearchMovieQuery) {
    return this.searchMoviesUseCase.execute({
      ...query,
      q: query.q ?? genre,
      genre,
    });
  }

  @Get('release/:date')
  findByReleaseDate(
    @Param('date') date: string,
    @Query() query: SearchMovieQuery,
  ) {
    return this.searchMoviesUseCase.execute({
      ...query,
      q: query.q ?? 'movie',
      releasedOn: date,
    });
  }
}
