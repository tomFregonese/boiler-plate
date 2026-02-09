import { Body, Controller, Get, Post, Param, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CinemasAdapter } from './cinemas.adapter.js';
import { BookSeatsDto } from './dtos/book-seats.dto.js';
import { CreateSessionDto } from './dtos/create-session.dto.js';
import {ApiBearerAuth} from "@nestjs/swagger";

@Controller('api/cinemas')
export class CinemasController {
  constructor(private readonly cinemas: CinemasAdapter) {}

  @Get()
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.cinemas.forward(req, res, '/cinemas');
  }

  @Get(':id/catalog')
  getCatalog(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, `/cinemas/${id}/catalog`);
  }

  @Get('movies/:filmId/sessions')
  getMovieSessions(
    @Param('filmId') filmId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, `/movies/${filmId}/sessions`);
  }

  @Get('sessions/:id/seats')
  getSessionSeats(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, `/sessions/${id}/seats`);
  }

  @Post('sessions/:id/book')
  @ApiBearerAuth()
  bookSeats(
    @Body() _body: BookSeatsDto,
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, `/sessions/${id}/book`);
  }

  @Get('admin/rooms/:roomId/availability')
  @ApiBearerAuth()
  checkRoomAvailability(
    @Param('roomId') roomId: string,
    @Query('date') _date: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, `/admin/rooms/${roomId}/availability`);
  }

  @Post('admin/sessions')
  @ApiBearerAuth()
  createSession(
    @Body() _body: CreateSessionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, '/admin/sessions');
  }
}
