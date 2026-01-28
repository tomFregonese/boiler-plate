import { Inject, Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { SessionNotFoundException } from '../../../domain/exceptions/session-not-found.exception';
import { SeatsAlreadyOccupiedException } from '../../../domain/exceptions/seats-already-occupied.exception';
import { SESSION_REPOSITORY } from '../../../infrastructure/token';

@Injectable()
export class BookSeatsUseCase {
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
    ) {}

    async execute(
        sessionId: string,
        seatIds: string[],
        userId: string,
    ): Promise<void> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new SessionNotFoundException(sessionId);
        }

        const occupiedSeats = session.seatOccupations
            .filter((o) => seatIds.includes(o.seatId) && !o.isFree())
            .map((o) => o.seatId);

        if (occupiedSeats.length > 0) {
            throw new SeatsAlreadyOccupiedException(occupiedSeats);
        }

        session.bookSeats(seatIds, userId);
        await this.sessionRepository.save(session);
    }
}
