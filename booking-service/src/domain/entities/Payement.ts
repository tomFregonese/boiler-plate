import { Money } from '../value-object/Money'
import { PaymentStatus } from '../value-object/PaymentStatus'

export class Payment {
	constructor(
		public readonly id: string | undefined,
		public readonly bookingId: string | undefined,
		public readonly provider: string,
		public readonly amount: Money,
		public status: PaymentStatus,
		public readonly createdAt?: Date,
		public readonly updatedAt?: Date,
	) {}

	complete() {
		this.status = PaymentStatus.COMPLETED
	}

	fail() {
		this.status = PaymentStatus.FAILED
	}
}
