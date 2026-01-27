export class SessionNotFoundException extends Error {
    constructor(sessionId: string) {
        super(`Session with id ${sessionId} not found`);
        this.name = 'SessionNotFoundException';
    }
}