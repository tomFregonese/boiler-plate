import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BookingAdapter } from './booking.adapter.js';
import {CreateBookingDto} from "./dtos/create-booking.dto";

@Controller('api/bookings')
export class BookingController {
    constructor(private readonly bookings: BookingAdapter) {}

    @Post()
    @ApiBearerAuth()
    create(@Body() _body: CreateBookingDto, @Req() req: Request, @Res() res: Response) {
        if (req.user) {
            req.body = { ...req.body, userId: req.user.uid };
        }

        return this.bookings.forward(req, res, '/bookings');
    }

    @Post(':id/confirm')
    @ApiBearerAuth()
    confirm(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}/confirm`);
    }

    @Post(':id/cancel')
    @ApiBearerAuth()
    cancel(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}/cancel`);
    }

    @Get(':id')
    @ApiBearerAuth()
    getById(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.bookings.forward(req, res, `/bookings/${id}`);
    }
}