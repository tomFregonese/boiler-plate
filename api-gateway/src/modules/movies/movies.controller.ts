import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { MoviesAdapter } from './movies.adapter.js';

@Controller('api/movies')
export class MoviesController {
  constructor(private readonly movies: MoviesAdapter) {}

  @Get()
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.movies.forward(req, res, '/movie');
  }

  @Get('title/:title')
  findByTitle(
    @Param('title') title: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.movies.forward(req, res, `/movie/title/${title}`);
  }

  @Get('title/:title/page/:page')
  findByTitlePaged(
    @Param('title') title: string,
    @Param('page') page: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.movies.forward(req, res, `/movie/title/${title}/page/${page}`);
  }

  @Get('id/:imdbId')
  findById(
    @Param('imdbId') imdbId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.movies.forward(req, res, `/movie/id/${imdbId}`);
  }

  @Get('genre/:genre')
  findByGenre(
    @Param('genre') genre: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.movies.forward(req, res, `/movie/genre/${genre}`);
  }

  @Get('release/:date')
  findByRelease(
    @Param('date') date: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.movies.forward(req, res, `/movie/release/${date}`);
  }
}
