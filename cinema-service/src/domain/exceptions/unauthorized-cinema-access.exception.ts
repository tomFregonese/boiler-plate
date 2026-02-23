export class UnauthorizedCinemaAccessException extends Error {
    constructor() {
        super(`This user is not authorized to access cinema`);
        this.name = 'UnauthorizedCinemaAccessException';
    }
}
