export class Room {
    constructor(
        private readonly _id: string,
        private readonly _name: string,
        private readonly _cinemaId: string,
        private readonly _seats: string[] = [],
    ) {}

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get cinemaId(): string {
        return this._cinemaId;
    }

    get seats(): string[] {
        return [...this._seats];
    }
}
