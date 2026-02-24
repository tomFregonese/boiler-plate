import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiConflictResponse,
    ApiBadRequestResponse,
    ApiTags,
} from '@nestjs/swagger';
import { BookingAdapter } from './booking.adapter.js';
import { CreateBookingDto } from './dtos/create-booking.dto.js';
import { BookingResponseDto } from './dtos/booking-response.dto.js';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('api/bookings')
export class BookingController {
    constructor(private readonly bookings: BookingAdapter) {}

    @Get()
    @ApiOperation({ summary: 'List the current user\'s bookings' })
    @ApiOkResponse({ description: 'List of bookings', type: [BookingResponseDto] })
    findAll(@Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, '/bookings');
    }

    @Post()
    @ApiOperation({ summary: 'Create a booking' })
    @ApiBody({ type: CreateBookingDto })
    @ApiCreatedResponse({ description: 'Booking created successfully', type: BookingResponseDto })
    @ApiConflictResponse({ description: 'Seat already booked for this session' })
    @ApiBadRequestResponse({ description: 'Seats unavailable or session not found' })
    create(@Body() _body: CreateBookingDto, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, '/bookings');
    }

    @Post(':id/confirm')
    @ApiOperation({ summary: 'Confirm a booking' })
    @ApiParam({ name: 'id', description: 'Booking UUID', example: 'b1234-5678-abcd' })
    @ApiOkResponse({ description: 'Booking confirmed', type: BookingResponseDto })
    @ApiNotFoundResponse({ description: 'Booking not found' })
    confirm(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}/confirm`);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancel a booking (releases the seats)' })
    @ApiParam({ name: 'id', description: 'Booking UUID', example: 'b1234-5678-abcd' })
    @ApiOkResponse({ description: 'Booking cancelled and seats released', type: BookingResponseDto })
    @ApiNotFoundResponse({ description: 'Booking not found' })
    cancel(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}/cancel`);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a booking by ID' })
    @ApiParam({ name: 'id', description: 'Booking UUID', example: 'b1234-5678-abcd' })
    @ApiOkResponse({ description: 'Booking found', type: BookingResponseDto })
    @ApiNotFoundResponse({ description: 'Booking not found' })
    getById(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}`);
    }
}