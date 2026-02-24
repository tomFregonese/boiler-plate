import { Inject, Injectable } from '@nestjs/common';
import { ICinemaRepository } from '../../../domain/repositories/cinema.repository';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { FilmInfo, IFilmService } from '../../ports/film-service.port';
import { CinemaNotFoundException } from '../../../domain/exceptions/cinema-not-found.exception';
import {
    CINEMA_REPOSITORY,
    FILM_SERVICE,
    SESSION_REPOSITORY,
} from '../../../infrastructure/token';

export interface CinemaCatalogResult {
    cinemaName: string;
    ticketPrice: number;
    sessions: Array<{
        sessionId: string;
        film: FilmInfo;
        startTime: Date;
        roomName: string;
    }>;
}

@Injectable()
export class GetCinemaCatalogUseCase {
    constructor(
        @Inject(CINEMA_REPOSITORY)
        private readonly cinemaRepository: ICinemaRepository,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
        @Inject(FILM_SERVICE)
        private readonly filmService: IFilmService,
    ) {}

    async execute(cinemaId: string): Promise<CinemaCatalogResult> {
        const cinema = await this.cinemaRepository.findById(cinemaId);
        if (!cinema) {
            throw new CinemaNotFoundException(cinemaId);
        }

        const sessions = await this.sessionRepository.findByCinemaId(cinemaId);

        const sessionResults = await Promise.allSettled(
            sessions.map(async (session) => ({
                sessionId: session.id,
                film: await this.filmService.getFilmById(session.filmId),
                startTime: session.startTime,
                roomName: session.roomName,
            })),
        );

        const sessionsWithFilm = sessionResults
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value);

        return {
            cinemaName: cinema.name,
            ticketPrice: cinema.ticketPrice,
            sessions: sessionsWithFilm,
        };
    }
}
