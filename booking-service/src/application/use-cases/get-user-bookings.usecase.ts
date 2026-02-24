import { Inject, Injectable } from '@nestjs/common'
import { Booking } from '../../domain/entities/Booking'
import { BOOKING_REPOSITORY } from '../../domain/repositories/IBookingRepository'
import type { IBookingRepository } from '../../domain/repositories/IBookingRepository'

@Injectable()
export class GetUserBookingsUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(userId: string): Promise<Booking[]> {
    return this.bookingRepository.findByUserId(userId)
  }
}
