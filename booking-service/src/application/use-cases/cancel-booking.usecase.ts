import { Inject, Injectable, Logger } from '@nestjs/common'
import { BookingNotFoundError } from '../../domain/errors/BookingNotFoundError'
import { BOOKING_REPOSITORY } from '../../domain/repositories/IBookingRepository'
import type { IBookingRepository } from '../../domain/repositories/IBookingRepository'
import { BookingStatus } from '../../domain/value-object/BookingStatus'
import { Booking } from '../../domain/entities/Booking'
import { CinemaServiceClient } from '../../infrastructure/http/cinema-service.client'

@Injectable()
export class CancelBookingUseCase {
  private readonly logger = new Logger(CancelBookingUseCase.name);

  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    private readonly cinemaServiceClient: CinemaServiceClient,
  ) {}

  async execute(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId)
    if (!booking) {
      throw new BookingNotFoundError()
    }

    booking.cancel()

    const updated = await this.bookingRepository.updateStatus(
      bookingId,
      BookingStatus.CANCELLED,
    )

    if (!updated) {
      throw new BookingNotFoundError()
    }

    // Release seats in cinema service
    try {
      const seatIds = booking.seats.map(s => s.seatId);
      await this.cinemaServiceClient.releaseSeats(booking.sessionId, seatIds);
      this.logger.log(`Released seats in cinema service for booking ${bookingId}`);
    } catch (error) {
      this.logger.error(`Failed to release seats in cinema service: ${error instanceof Error ? error.message : error}`);
      // The booking is already cancelled in our database, but we must surface this partial failure
      throw new Error(
        'Failed to release seats in cinema service. Booking was cancelled in local database, but seats may still be reserved.',
      );
    }

    this.logger.log(`Successfully cancelled booking ${bookingId}`);

    return updated
  }
}
