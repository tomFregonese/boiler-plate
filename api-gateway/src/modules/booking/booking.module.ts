import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller.js';
import { BookingAdapter } from './booking.adapter.js';

@Module({
    controllers: [BookingController],
    providers: [BookingAdapter],
})
export class BookingModule {}