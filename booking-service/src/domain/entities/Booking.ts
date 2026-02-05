import { BookingStatus } from '../value-object/BookingStatus'
import { BookingSeat } from './BookingSeat'
import { Payment } from './Payement'

export class Booking {
    constructor(
        public readonly id: string | undefined,
        public readonly userId: string,
        public readonly screeningId: string,
        public status: BookingStatus,
        public readonly seats: BookingSeat[],
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date,
        public readonly payment?: Payment,
    ) {}

    confirm() {
        if (this.status === BookingStatus.PENDING) {
            this.status = BookingStatus.CONFIRMED
        }
    }

    cancel() {
        if (this.status !== BookingStatus.CANCELLED) {
            this.status = BookingStatus.CANCELLED
        }
    }
}