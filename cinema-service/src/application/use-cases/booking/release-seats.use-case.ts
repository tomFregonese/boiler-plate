import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { SessionNotFoundException } from '../../../domain/exceptions/session-not-found.exception';
import { SESSION_REPOSITORY } from '../../../infrastructure/token';

@Injectable()
export class ReleaseSeatsUseCase {
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
    ) {}

    async execute(
        sessionId: string,
        seatIds: string[],
    ): Promise<void> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new SessionNotFoundException(sessionId);
        }

        // Find the seat occupations to release
        const occupationsToRelease = session.seatOccupations.filter(
            (o) => seatIds.includes(o.seatId)
        );

        if (occupationsToRelease.length === 0) {
            throw new BadRequestException('No seats found to release');
        }

        // Release the seats by calling a method on the session entity
        session.releaseSeats(seatIds);

        await this.sessionRepository.save(session);
    }
}
