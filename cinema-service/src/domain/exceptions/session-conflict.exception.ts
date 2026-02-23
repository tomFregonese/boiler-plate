export class SessionConflictException extends Error {
    constructor(roomId: string, startTime: Date, endTime: Date) {
        super(
            `Session conflict in room ${roomId}: time slot ${startTime.toISOString()} - ${endTime.toISOString()} overlaps with existing session`,
        );
        this.name = 'SessionConflictException';
    }
}
