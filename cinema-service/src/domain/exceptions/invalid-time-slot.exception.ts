export class InvalidTimeSlotException extends Error {
    constructor(hour: number) {
        super(`Invalid time slot: ${hour}. Must be 10, 13, 16 or 19`);
        this.name = 'InvalidTimeSlotException';
    }
}