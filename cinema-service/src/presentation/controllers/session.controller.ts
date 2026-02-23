import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Headers as HeadersDecorator,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiHeader,
    ApiSecurity,
} from '@nestjs/swagger';
import { MovieSessionsDto } from '../dtos/session/movie-sessions.dto';
import { SessionSeatMapDto } from '../dtos/session/session-seat-map.dto';
import { BookSeatsDto } from '../dtos/session/book-seats.dto';
import { GetMovieSessionsUseCase } from '../../application/use-cases/catalog/get-movie-sessions.use-case';
import { GetSessionSeatMapUseCase } from '../../application/use-cases/catalog/get-session-seat-map.use-case';
import { BookSeatsUseCase } from '../../application/use-cases/booking/book-seats.use-case';

@ApiTags('sessions')
@ApiSecurity('x-api-key')
@Controller()
export class SessionController {
    constructor(
        private readonly getMovieSessionsUseCase: GetMovieSessionsUseCase,
        private readonly getSessionSeatMapUseCase: GetSessionSeatMapUseCase,
        private readonly bookSeatsUseCase: BookSeatsUseCase,
    ) {}

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
    async getMovieSessions(
        @Param('filmId') filmId: string,
    ): Promise<MovieSessionsDto> {
        const result = await this.getMovieSessionsUseCase.execute(filmId);

        return {
            film: result.film,
            providers: result.providers.map((provider) => ({
                cinemaId: provider.cinemaId,
                cinemaName: provider.cinemaName,
                sessions: provider.sessions.map((session) => ({
                    sessionId: session.sessionId,
                    startTime: session.startTime.toISOString(),
                })),
            })),
        };
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
    async getSessionSeatMap(
        @Param('id') id: string,
    ): Promise<SessionSeatMapDto> {
        const result = await this.getSessionSeatMapUseCase.execute(id);

        return {
            sessionId: result.sessionId,
            film: result.film,
            rows: result.rows.map((row) => ({
                rowName: row.rowName,
                seats: row.seats.map((seat) => ({
                    seatId: seat.seatId,
                    columnNumber: seat.columnNumber,
                    status: seat.status,
                })),
            })),
        };
    }

    @ApiOperation({ summary: 'Book seats for a session' })
    @ApiParam({ name: 'id', description: 'Unique identifier of the session' })
    @ApiHeader({
        name: 'x-user-id',
        description: 'User identifier injected by the gateway',
        required: true,
    })
/*    @ApiHeader({
        name: 'X-User-Role',
        description: 'User role injected by the gateway',
        required: true,
    })*/
    @ApiResponse({ status: 200, description: 'Seats booked successfully' })
    @ApiResponse({
        status: 400,
        description: 'Invalid request or seats already occupied',
    })
    @ApiResponse({ status: 404, description: 'Session not found' })
    @Post('sessions/:id/book')
    async bookSeats(
        @Param('id') sessionId: string,
        @Body() bookSeatsDto: BookSeatsDto,
        @HeadersDecorator('x-user-id') userId: string,
        //@HeadersDecorator('X-User-Role') userRole: string,
    ): Promise<void> {
        await this.bookSeatsUseCase.execute(
            sessionId,
            bookSeatsDto.seatIds,
            userId,
        );
    }
}
