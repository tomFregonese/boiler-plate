import { Inject, Injectable } from '@nestjs/common'
import { Booking } from '../../domain/entities/Booking'
import { BookingSeat } from '../../domain/entities/BookingSeat'
import { Payment } from '../../domain/entities/Payement'
import { BOOKING_REPOSITORY } from '../../domain/repositories/IBookingRepository'
import type { IBookingRepository } from '../../domain/repositories/IBookingRepository'
import { BookingStatus } from '../../domain/value-object/BookingStatus'
import { Money } from '../../domain/value-object/Money'
import { PaymentStatus } from '../../domain/value-object/PaymentStatus'

export interface CreateBookingInput {
  userId: string
  screeningId: string
  seatIds: string[]
  payment?: {
    provider: string
    amount: number
    currency: string
  }
}

@Injectable()
export class CreateBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    const seatIds = Array.from(new Set(input.seatIds))

    const seats = seatIds.map(
      (seatId) => new BookingSeat(undefined, undefined, input.screeningId, seatId),
    )

    const booking = new Booking(
      undefined,
      input.userId,
      input.screeningId,
      BookingStatus.PENDING,
      seats,
    )

    const payment = input.payment
      ? new Payment(
          undefined,
          undefined,
          input.payment.provider,
          new Money(input.payment.amount, input.payment.currency),
          PaymentStatus.PENDING,
        )
      : undefined

    return this.bookingRepository.create(booking, payment)
  }
}
