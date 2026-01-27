export class UnauthorizedCinemaAccessException extends Error {
    constructor(userId: string, cinemaId: string) {
        super(`User ${userId} is not authorized to access cinema ${cinemaId}`);
        this.name = 'UnauthorizedCinemaAccessException';
    }
}
