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

    @Post()
    @ApiOperation({ summary: 'Créer une réservation' })
    @ApiBody({ type: CreateBookingDto })
    @ApiCreatedResponse({ description: 'Réservation créée avec succès', type: BookingResponseDto })
    @ApiConflictResponse({ description: 'Siège déjà réservé pour cette session' })
    @ApiBadRequestResponse({ description: 'Sièges indisponibles ou session introuvable' })
    create(@Body() _body: CreateBookingDto, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, '/bookings');
    }

    @Post(':id/confirm')
    @ApiOperation({ summary: 'Confirmer une réservation' })
    @ApiParam({ name: 'id', description: 'UUID du booking', example: 'b1234-5678-abcd' })
    @ApiOkResponse({ description: 'Réservation confirmée', type: BookingResponseDto })
    @ApiNotFoundResponse({ description: 'Réservation introuvable' })
    confirm(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}/confirm`);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Annuler une réservation (libère les sièges)' })
    @ApiParam({ name: 'id', description: 'UUID du booking', example: 'b1234-5678-abcd' })
    @ApiOkResponse({ description: 'Réservation annulée et sièges libérés', type: BookingResponseDto })
    @ApiNotFoundResponse({ description: 'Réservation introuvable' })
    cancel(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}/cancel`);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Récupérer une réservation par id' })
    @ApiParam({ name: 'id', description: 'UUID du booking', example: 'b1234-5678-abcd' })
    @ApiOkResponse({ description: 'Réservation trouvée', type: BookingResponseDto })
    @ApiNotFoundResponse({ description: 'Réservation introuvable' })
    getById(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}`);
    }
}