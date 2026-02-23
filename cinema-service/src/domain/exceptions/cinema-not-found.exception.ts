export class CinemaNotFoundException extends Error {
    constructor(cinemaId: string) {
        super(`Cinema with id ${cinemaId} not found`);
        this.name = 'CinemaNotFoundException';
    }
}
