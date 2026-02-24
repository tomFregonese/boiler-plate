export class Cinema {
    constructor(
        private readonly _id: string,
        private readonly _name: string,
        private readonly _address: string,
        private readonly _city: string,
        private readonly _postalCode: string,
        private readonly _rooms: string[] = [],
        private readonly _ticketPrice: number = 0,
    ) {}

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get address(): string {
        return this._address;
    }

    get city(): string {
        return this._city;
    }

    get postalCode(): string {
        return this._postalCode;
    }

    get ticketPrice(): number {
        return this._ticketPrice;
    }

    get rooms(): string[] {
        return [...this._rooms];
    }
}
