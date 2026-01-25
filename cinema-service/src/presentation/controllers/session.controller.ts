import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MovieSessionsDto } from '../dtos/session/movie-sessions.dto';
import { SessionSeatMapDto } from '../dtos/session/session-seat-map.dto';
import { BookSeatsDto } from '../dtos/session/book-seats.dto';

@ApiTags('sessions')
@Controller()
export class SessionController {
    @ApiOperation({
        summary: 'Get all sessions for a specific film across all cinemas',
    })
    @ApiParam({ name: 'filmId', description: 'Identifier of the film' })
    @ApiResponse({
        status: 200,
        description: 'List of sessions retrieved successfully',
        type: MovieSessionsDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Film not found or no sessions available',
    })
    @Get('movies/:filmId/sessions')
    getMovieSessions(@Param('filmId') filmId: string) {
        return {};
    }

    @ApiOperation({ summary: 'Get the seat map for a specific session' })
    @ApiParam({ name: 'id', description: 'Unique identifier of the session' })
    @ApiResponse({
        status: 200,
        description: 'Seat map retrieved successfully',
        type: SessionSeatMapDto,
    })
    @ApiResponse({ status: 404, description: 'Session not found' })
    @Get('sessions/:id/seats')
    getSessionSeatMap(@Param('id') id: string) {
        return {};
    }

    @ApiOperation({ summary: 'Book seats for a session' })
    @ApiParam({ name: 'id', description: 'Unique identifier of the session' })
    @ApiResponse({ status: 200, description: 'Seats booked successfully' })
    @ApiResponse({
        status: 400,
        description: 'Invalid request or seats already occupied',
    })
    @ApiResponse({ status: 404, description: 'Session not found' })
    @Post('sessions/:id/book')
    bookSeats(
        @Param('id') sessionId: string,
        @Body() bookSeatsDto: BookSeatsDto,
    ) {
        return {};
    }
}