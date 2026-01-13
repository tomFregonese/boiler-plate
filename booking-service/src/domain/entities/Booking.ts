export class Booking {
    constructor(
        readonly id : string,
        readonly userId : string,
        readonly showtimeId : string,
        readonly seatNumber : string,
        readonly createdAt : Date,
        readonly updatedAt : Date,
    ) {}
}