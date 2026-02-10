export class SeatAlreadyBookedError extends Error {
  constructor(message = 'Seat already booked for this screening') {
    super(message)
    this.name = 'SeatAlreadyBookedError'
  }
}
