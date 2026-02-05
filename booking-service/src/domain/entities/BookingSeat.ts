export class BookingSeat {
  constructor(
    public readonly id: string | undefined,
    public readonly bookingId: string | undefined,
    public readonly screeningId: string,
    public readonly seatId: string,
  ) {}
}
