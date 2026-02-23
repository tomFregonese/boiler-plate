import { Inject, Injectable } from '@nestjs/common'
import { BookingNotFoundError } from '../../domain/errors/BookingNotFoundError'
import { BOOKING_REPOSITORY } from '../../domain/repositories/IBookingRepository'
import type { IBookingRepository } from '../../domain/repositories/IBookingRepository'
import { BookingStatus } from '../../domain/value-object/BookingStatus'
import { Booking } from '../../domain/entities/Booking'

@Injectable()
export class CancelBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
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

    return updated
  }
}
