export class SeatsNotFoundException extends Error {
    constructor(roomId: string) {
        super(`Seats not found in room : ${roomId}`);
        this.name = 'SeatsNotFoundException';
    }
}
