import { Inject, Injectable, Logger } from '@nestjs/common'
import { Booking } from '../../domain/entities/Booking'
import { BookingSeat } from '../../domain/entities/BookingSeat'
import { Payment } from '../../domain/entities/Payement'
import { BOOKING_REPOSITORY } from '../../domain/repositories/IBookingRepository'
import type { IBookingRepository } from '../../domain/repositories/IBookingRepository'
import { BookingStatus } from '../../domain/value-object/BookingStatus'
import { Money } from '../../domain/value-object/Money'
import { PaymentStatus } from '../../domain/value-object/PaymentStatus'
import { CinemaServiceClient } from '../../infrastructure/http/cinema-service.client'

export interface CreateBookingInput {
  userId: string
  sessionId: string
  seatIds: string[]
  payment?: {
    provider: string
    amount: number
    currency: string
  }
}

@Injectable()
export class CreateBookingUseCase {
  private readonly logger = new Logger(CreateBookingUseCase.name);

  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    private readonly cinemaServiceClient: CinemaServiceClient,
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    const seatIds = Array.from(new Set(input.seatIds))

    // First, try to book seats in the cinema service
    // This will verify that the session exists and seats are available
    this.logger.log(`Attempting to book seats in cinema service for session ${input.sessionId}`);
    
    try {
      await this.cinemaServiceClient.bookSeats(
        input.sessionId,
        seatIds,
        input.userId,
      );
    } catch (error) {
      this.logger.error(`Failed to book seats in cinema service: ${error instanceof Error ? error.message : error}`);
      throw error;
    }

    // If cinema service booking succeeded, create the booking in our database
    const seats = seatIds.map(
      (seatId) => new BookingSeat(undefined, undefined, input.sessionId, seatId),
    )

    const booking = new Booking(
      undefined,
      input.userId,
      input.sessionId,
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

    try {
      const createdBooking = await this.bookingRepository.create(booking, payment);

      this.logger.log(`Successfully created booking ${createdBooking.id}`);

      return createdBooking;
    } catch (error) {
      this.logger.error(
        `Failed to create booking in database for session ${input.sessionId}. Attempting to release seats in cinema service. Error: ${
          error instanceof Error ? error.message : error
        }`,
      )

      try {
        await this.cinemaServiceClient.releaseSeats(
          input.sessionId,
          seatIds,
        )
        this.logger.log(
          `Successfully released seats in cinema service for failed booking on session ${input.sessionId}`,
        )
      } catch (releaseError) {
        this.logger.error(
          `Failed to release seats in cinema service after booking creation failure for session ${input.sessionId}: ${
            releaseError instanceof Error ? releaseError.message : releaseError
          }`,
        );
      }

      throw error;
    }
  }
}
