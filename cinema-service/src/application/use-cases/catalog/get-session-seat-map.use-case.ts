import { Inject, Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { ISeatRepository } from '../../../domain/repositories/seat.repository';
import { FilmInfo, IFilmService } from '../../ports/film-service.port';
import { SessionNotFoundException } from '../../../domain/exceptions/session-not-found.exception';
import {
    FILM_SERVICE,
    SEAT_REPOSITORY,
    SESSION_REPOSITORY,
} from '../../../infrastructure/token';

export interface SessionSeatMapResult {
    sessionId: string;
    film: FilmInfo;
    rows: Array<{
        rowName: string;
        seats: Array<{
            seatId: string;
            columnNumber: number;
            status: 'FREE' | 'OCCUPIED';
        }>;
    }>;
}

@Injectable()
export class GetSessionSeatMapUseCase {
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
        @Inject(SEAT_REPOSITORY)
        private readonly seatRepository: ISeatRepository,
        @Inject(FILM_SERVICE)
        private readonly filmService: IFilmService,
    ) {}

    async execute(sessionId: string): Promise<SessionSeatMapResult> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new SessionNotFoundException(sessionId);
        }

        const seats = await this.seatRepository.findByRoomId(session.roomId);
        const film = await this.filmService.getFilmById(session.filmId);

        const rowsMap = new Map<string, typeof seats>();

        for (const seat of seats) {
            const existing = rowsMap.get(seat.row) || [];
            rowsMap.set(seat.row, [...existing, seat]);
        }

        const rows = Array.from(rowsMap.entries()).map(
            ([rowName, rowSeats]) => ({
                rowName,
                seats: rowSeats.map((seat) => {
                    const occupation = session.seatOccupations.find(
                        (o) => o.seatId === seat.id,
                    );
                    const status: 'FREE' | 'OCCUPIED' =
                        occupation?.isFree() !== false ? 'FREE' : 'OCCUPIED';

                    return {
                        seatId: seat.id,
                        columnNumber: seat.number,
                        status,
                    };
                }),
            }),
        );

        return {
            sessionId: session.id,
            film,
            rows,
        };
    }
}
