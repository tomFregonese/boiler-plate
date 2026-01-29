import { Inject, Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { ICinemaRepository } from '../../../domain/repositories/cinema.repository';
import { FilmInfo, IFilmService } from '../../ports/film-service.port';
import {
    CINEMA_REPOSITORY,
    FILM_SERVICE,
    SESSION_REPOSITORY,
} from '../../../infrastructure/token';

export interface MovieSessionsResult {
    film: FilmInfo;
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
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
        @Inject(CINEMA_REPOSITORY)
        private readonly cinemaRepository: ICinemaRepository,
        @Inject(FILM_SERVICE)
        private readonly filmService: IFilmService,
    ) {}

    async execute(filmId: string): Promise<MovieSessionsResult> {
        const sessions = await this.sessionRepository.findByFilmId(filmId);
        const film = await this.filmService.getFilmById(filmId);

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
            film,
            providers,
        };
    }
}
