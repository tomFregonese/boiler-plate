import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiHeader,
} from '@nestjs/swagger';
import { RoomAvailabilityDto } from '../dtos/admin/room-availability.dto';
import { CreateSessionDto } from '../dtos/admin/create-session.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
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
        name: 'X-User-Cinema-Id',
        description: 'Cinema ID of the authenticated admin',
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
    getRoomAvailability(
        @Param('roomId') roomId: string,
        @Query('date') date: string,
    ) {
        return {};
    }

    @ApiOperation({ summary: 'Create a new session for a film in a room' })
    @ApiHeader({
        name: 'X-User-Cinema-Id',
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
    createSession(@Body() createSessionDto: CreateSessionDto) {
        return {};
    }
}