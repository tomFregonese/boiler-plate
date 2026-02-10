export class BookingNotFoundError extends Error {
  constructor(message = 'Booking not found') {
    super(message)
    this.name = 'BookingNotFoundError'
  }
}
