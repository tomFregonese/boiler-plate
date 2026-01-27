export class Seat {
    constructor(
        private readonly _id: string,
        private readonly _row: string,
        private readonly _number: number,
        private readonly _roomId: string,
    ) {}

    get id(): string {
        return this._id;
    }

    get row(): string {
        return this._row;
    }

    get number(): number {
        return this._number;
    }

    get roomId(): string {
        return this._roomId;
    }
}
