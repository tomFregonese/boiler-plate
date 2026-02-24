import { Booking } from '../../../domain/entities/Booking'
import { BookingSeat } from '../../../domain/entities/BookingSeat'
import { Payment } from '../../../domain/entities/Payement'
import { Money } from '../../../domain/value-object/Money'
import { BookingStatus } from '../../../domain/value-object/BookingStatus'
import { PaymentStatus } from '../../../domain/value-object/PaymentStatus'
import {
	Booking as PrismaBooking,
	BookingSeat as PrismaBookingSeat,
	Payment as PrismaPayment,
	BookingStatus as PrismaBookingStatus,
	PaymentStatus as PrismaPaymentStatus,
} from '@prisma/client'

export class BookingMapper {
	static toDomain(
		booking: PrismaBooking & {
			seats: PrismaBookingSeat[]
			payment: PrismaPayment | null
		},
	): Booking {
		const seats = booking.seats.map(
			(seat) =>
				new BookingSeat(seat.id, seat.bookingId, seat.sessionId, seat.seatId),
		)

		const payment = booking.payment
			? new Payment(
					booking.payment.id,
					booking.payment.bookingId,
					booking.payment.provider,
					new Money(booking.payment.amount, booking.payment.currency),
					BookingMapper.toDomainPaymentStatus(booking.payment.status),
					booking.payment.createdAt,
					booking.payment.updatedAt,
				)
			: undefined

		return new Booking(
			booking.id,
			booking.userId,
			booking.sessionId,
			BookingMapper.toDomainBookingStatus(booking.status),
			seats,
			booking.createdAt,
			booking.updatedAt,
			payment,
		)
	}

	static toDomainBookingStatus(status: PrismaBookingStatus): BookingStatus {
		return status as unknown as BookingStatus
	}

	static toDomainPaymentStatus(status: PrismaPaymentStatus): PaymentStatus {
		return status as unknown as PaymentStatus
	}
}
