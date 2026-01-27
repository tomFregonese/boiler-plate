export class RoomAlreadyOccupiedException extends Error {
    constructor(roomId: string, startTime: Date) {
        super(
            `Room ${roomId} is already occupied at ${startTime.toISOString()}`,
        );
        this.name = 'RoomAlreadyOccupiedException';
    }
}
