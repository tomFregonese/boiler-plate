import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Query,
    Headers as HeadersDecorator,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiHeader,
    ApiSecurity,
} from '@nestjs/swagger';
import { RoomAvailabilityDto } from '../dtos/admin/room-availability.dto';
import { CreateSessionDto } from '../dtos/admin/create-session.dto';
import { CheckRoomAvailabilityUseCase } from '../../application/use-cases/admin/check-room-availability.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/admin/create-session.use-case';

@ApiTags('admin')
@ApiSecurity('x-api-key')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly checkRoomAvailabilityUseCase: CheckRoomAvailabilityUseCase,
        private readonly createSessionUseCase: CreateSessionUseCase,
    ) {}

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
    @ApiHeader({
        name: 'x-user-role',
        description: 'User role injected by the gateway',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Room availability retrieved successfully',
        type: RoomAvailabilityDto,
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Admin does not have access to this room',
    })
    @ApiResponse({ status: 404, description: 'Room not found' })
    @Get('my-cinema/rooms/:roomId/availability')
    async getRoomAvailability(
        @Param('roomId') roomId: string,
        @Query('date') date: string,
        @HeadersDecorator('x-user-role') userRole: string,
    ): Promise<RoomAvailabilityDto> {
        const result = await this.checkRoomAvailabilityUseCase.execute(
            roomId,
            date,
            userRole,
        );

        return {
            roomId: result.roomId,
            date: result.date,
            sessions: result.sessions.map((session) => ({
                sessionId: session.sessionId,
                film: session.film,
                startTime: session.startTime.toISOString(),
                endTime: session.endTime.toISOString(),
            })),
        };
    }

    @ApiOperation({ summary: 'Create a new session for a film in a room' })
    @ApiHeader({
        name: 'x-user-cinema-id',
        description: 'Cinema ID of the authenticated admin',
        required: true,
    })
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
    @Post('sessions')
    async createSession(
        @Body() createSessionDto: CreateSessionDto,
        @HeadersDecorator('x-user-cinema-id') userCinemaId: string,
    ): Promise<{ sessionId: string }> {
        const session = await this.createSessionUseCase.execute(
            createSessionDto.filmId,
            createSessionDto.roomId,
            new Date(createSessionDto.startTime),
            new Date(createSessionDto.endTime),
            userCinemaId,
        );

        return { sessionId: session.id };
    }
}
