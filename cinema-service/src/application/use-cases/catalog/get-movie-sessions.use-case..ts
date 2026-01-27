import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { ICinemaRepository } from '../../../domain/repositories/cinema.repository';
import { IFilmService } from '../../ports/film-service.port';

export interface MovieSessionsResult {
    filmId: string;
    filmTitle: string;
    providers: Array<{
        cinemaId: string;
        cinemaName: string;
        sessions: Array<{
            sessionId: string;
            startTime: Date;
        }>;
    }>;
}

@Injectable()
export class GetMovieSessionsUseCase {
    constructor(
        private readonly sessionRepository: ISessionRepository,
        private readonly cinemaRepository: ICinemaRepository,
        private readonly filmService: IFilmService,
    ) {}

    async execute(filmId: string): Promise<MovieSessionsResult> {
        const sessions = await this.sessionRepository.findByFilmId(filmId);
        const filmTitle = await this.filmService.getFilmTitle(filmId);

        const sessionsByCinema = new Map<string, typeof sessions>();

        for (const session of sessions) {
            const existing = sessionsByCinema.get(session.roomId) || [];
            sessionsByCinema.set(session.roomId, [...existing, session]);
        }

        const providers = await Promise.all(
            Array.from(sessionsByCinema.entries()).map(
                async ([roomId, roomSessions]) => {
                    // TODO: get cinema from roomId
                    return {
                        cinemaId: 'todo',
                        cinemaName: 'todo',
                        sessions: roomSessions.map((s) => ({
                            sessionId: s.id,
                            startTime: s.startTime,
                        })),
                    };
                },
            ),
        );

        return {
            filmId,
            filmTitle,
            providers,
        };
    }
}
