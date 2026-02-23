import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse, ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam
} from '@nestjs/swagger';
import { BookingAdapter } from './booking.adapter.js';
import { CreateBookingDto } from './dtos/create-booking.dto.js';

@Controller('api/bookings')
export class BookingController {
    constructor(private readonly bookings: BookingAdapter) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Créer un booking' })
    @ApiBody({ type: CreateBookingDto })
    @ApiCreatedResponse({ description: 'Booking créé avec succès' })
    @ApiConflictResponse({ description: 'Siège déjà réservé pour la séance' })
    create(@Body() _body: CreateBookingDto, @Req() req: Request, @Res() res: Response) {
        if (req.user) {
            req.body = { ...req.body, userId: req.user.uid };
        }

        return this.bookings.forward(req, res, '/bookings');
    }

    @Post(':id/confirm')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Confirmer un booking' })
    @ApiParam({ name: 'id', description: 'Identifiant du booking' })
    @ApiOkResponse({ description: 'Booking confirmé' })
    @ApiNotFoundResponse({ description: 'Booking introuvable' })
    confirm(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}/confirm`);
    }

    @Post(':id/cancel')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Annuler un booking' })
    @ApiParam({ name: 'id', description: 'Identifiant du booking' })
    @ApiOkResponse({ description: 'Booking annulé' })
    @ApiNotFoundResponse({ description: 'Booking introuvable' })
    cancel(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}/cancel`);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Récupérer un booking par id' })
    @ApiParam({ name: 'id', description: 'Identifiant du booking' })
    @ApiOkResponse({ description: 'Booking trouvé' })
    @ApiNotFoundResponse({ description: 'Booking introuvable' })
    getById(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}`);
    }
}