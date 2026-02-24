import { Body, Controller, Get, Post, Param, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CinemasAdapter } from './cinemas.adapter.js';
import { BookSeatsDto } from './dtos/book-seats.dto.js';
import { CreateSessionDto } from './dtos/create-session.dto.js';
import {ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse} from "@nestjs/swagger";

@Controller('api/cinemas')
export class CinemasController {
  constructor(private readonly cinemas: CinemasAdapter) {}

  @Get()
  @ApiOperation({ summary: 'List all cinemas' })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Filter cinemas by city',
  })
  @ApiQuery({
    name: 'postalCode',
    required: false,
    description: 'Filter cinemas by postal code',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cinemas retrieved successfully',
  })
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.cinemas.forward(req, res, '/cinemas');
  }

  @Get(':id/catalog')
  @ApiOperation({
    summary: 'Get the complete catalog (schedule) of a cinema',
  })
  @ApiParam({ name: 'id', description: 'Unique identifier of the cinema' })
  @ApiResponse({
    status: 200,
    description: 'Cinema catalog retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Cinema not found' })
  getCatalog(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, `/cinemas/${id}/catalog`);
  }

  @Get(':id/rooms')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rooms for a specific cinema' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the cinema' })
  @ApiResponse({
    status: 200,
    description: 'List of rooms retrieved successfully',
  })
  getCinemaRooms(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, `/cinemas/${id}/rooms`);
  }

  @Get('movies/:filmId/sessions')
  @ApiOperation({
    summary: 'Get all sessions for a specific film across all cinemas',
  })
  @ApiParam({ name: 'filmId', description: 'Identifier of the film' })
  @ApiResponse({
    status: 200,
    description: 'List of sessions retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Film not found or no sessions available',
  })
  getMovieSessions(
    @Param('filmId') filmId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, `/movies/${filmId}/sessions`);
  }

  @Get('sessions/:id/seats')
  @ApiOperation({ summary: 'Get the seat map for a specific session' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the session' })
  @ApiResponse({
    status: 200,
    description: 'Seat map retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  getSessionSeats(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, `/sessions/${id}/seats`);
  }

  @Post('sessions/:id/book')
  @ApiOperation({ summary: 'Book seats for a session' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the session' })
  @ApiResponse({ status: 200, description: 'Seats booked successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or seats already occupied',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
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
  @ApiOperation({
    summary:
        'Check room availability for all 4 time slots on a specific date',
  })
  @ApiParam({ name: 'roomId', description: 'Unique identifier of the room' })
  @ApiQuery({
    name: 'date',
    description: 'Date to check availability (YYYY-MM-DD format)',
    example: '2025-01-26',
  })
  @ApiResponse({
    status: 200,
    description: 'Room availability retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin does not have access to this room',
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
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
  @ApiOperation({ summary: 'Create a new session for a film in a room' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({
    status: 400,
    description:
        'Invalid request - Invalid time slot or room already occupied',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin does not have access to this room',
  })
  @ApiResponse({ status: 404, description: 'Room or film not found' })
  createSession(
    @Body() _body: CreateSessionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.cinemas.forward(req, res, '/admin/sessions');
  }
}
