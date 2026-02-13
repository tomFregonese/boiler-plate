import { Inject, Injectable } from '@nestjs/common'
import { BookingNotFoundError } from '../../domain/errors/BookingNotFoundError'
import { Booking } from '../../domain/entities/Booking'
import { BOOKING_REPOSITORY } from '../../domain/repositories/IBookingRepository'
import type { IBookingRepository } from '../../domain/repositories/IBookingRepository'

@Injectable()
export class GetBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId)
    if (!booking) {
      throw new BookingNotFoundError()
    }

    return booking
  }
}
