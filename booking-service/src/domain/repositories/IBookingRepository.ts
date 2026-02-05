import { Booking } from '../entities/Booking'
import { Payment } from '../entities/Payement'
import { BookingStatus } from '../value-object/BookingStatus'

export const BOOKING_REPOSITORY = 'BOOKING_REPOSITORY'

export interface IBookingRepository {
	create(booking: Booking, payment?: Payment): Promise<Booking>
	findById(id: string): Promise<Booking | null>
	updateStatus(id: string, status: BookingStatus): Promise<Booking | null>
	addPayment(bookingId: string, payment: Payment): Promise<Payment>
}

