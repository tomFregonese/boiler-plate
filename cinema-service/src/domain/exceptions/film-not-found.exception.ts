export class FilmNotFoundException extends Error {
    constructor(filmId: string) {
        super(`Film with ID ${filmId} not found`);
        this.name = 'FilmNotFoundException';
    }
}
