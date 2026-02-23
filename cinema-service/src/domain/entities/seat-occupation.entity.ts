export enum OccupationStatus {
    FREE = 'FREE',
    OCCUPIED = 'OCCUPIED',
}

export class SeatOccupation {
    constructor(
        private readonly _sessionId: string,
        private readonly _seatId: string,
        private readonly _status: OccupationStatus,
        private readonly _userId?: string,
    ) {}

    get sessionId(): string {
        return this._sessionId;
    }

    get seatId(): string {
        return this._seatId;
    }

    get status(): OccupationStatus {
        return this._status;
    }

    get userId(): string | undefined {
        return this._userId;
    }

    isFree(): boolean {
        return this._status === OccupationStatus.FREE;
    }
}
