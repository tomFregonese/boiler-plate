import { OccupationStatus, SeatOccupation } from './seat-occupation.entity';

export class Session {
    constructor(
        private readonly _id: string,
        private readonly _filmId: string,
        private readonly _roomId: string,
        private readonly _startTime: Date,
        private _seatOccupations: SeatOccupation[] = [],
    ) {}

    get id(): string {
        return this._id;
    }

    get filmId(): string {
        return this._filmId;
    }

    get roomId(): string {
        return this._roomId;
    }

    get startTime(): Date {
        return this._startTime;
    }

    get seatOccupations(): SeatOccupation[] {
        return [...this._seatOccupations];
    }

    getTimeSlot(): number {
        return this._startTime.getHours();
    }

    isValidTimeSlot(): boolean {
        const slot = this.getTimeSlot();
        return [10, 13, 16, 19].includes(slot);
    }

    bookSeats(seatIds: string[], userId: string): void {
        this._seatOccupations = this._seatOccupations.map((occupation) => {
            if (seatIds.includes(occupation.seatId)) {
                return new SeatOccupation(
                    occupation.sessionId,
                    occupation.seatId,
                    OccupationStatus.OCCUPIED,
                    userId,
                );
            }
            return occupation;
        });
    }
}
