export class RoomNotFoundException extends Error {
    constructor(roomId: string) {
        super(`Room with id ${roomId} not found`);
        this.name = 'RoomNotFoundException';
    }
}
