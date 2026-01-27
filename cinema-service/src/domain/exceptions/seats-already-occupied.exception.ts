export class SeatsAlreadyOccupiedException extends Error {
    constructor(seatIds: string[]) {
        super(`Seats already occupied: ${seatIds.join(', ')}`);
        this.name = 'SeatsAlreadyOccupiedException';
    }
}
