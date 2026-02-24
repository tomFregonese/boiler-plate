export class SeatAlreadyBookedError extends Error {
  constructor(message = 'Seat already booked for this session') {
    super(message)
    this.name = 'SeatAlreadyBookedError'
  }
}
