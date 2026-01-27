import { Injectable } from '@nestjs/common';
import { ICinemaRepository } from '../../../domain/repositories/cinema.repository';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { IFilmService } from '../../ports/film-service.port';
import { CinemaNotFoundException } from '../../../domain/exceptions/cinema-not-found.exception';

export interface CinemaCatalogResult {
    cinemaName: string;
    sessions: Array<{
        sessionId: string;
        filmId: string;
        filmTitle: string;
        startTime: Date;
        roomName: string;
    }>;
}

@Injectable()
export class GetCinemaCatalogUseCase {
    constructor(
        private readonly cinemaRepository: ICinemaRepository,
        private readonly sessionRepository: ISessionRepository,
        private readonly filmService: IFilmService,
    ) {}

    async execute(cinemaId: string): Promise<CinemaCatalogResult> {
        const cinema = await this.cinemaRepository.findById(cinemaId);
        if (!cinema) {
            throw new CinemaNotFoundException(cinemaId);
        }

        const sessions = await this.sessionRepository.findByCinemaId(cinemaId);

        const sessionsWithFilmTitles = await Promise.all(
            sessions.map(async (session) => ({
                sessionId: session.id,
                filmId: session.filmId,
                filmTitle: await this.filmService.getFilmTitle(session.filmId),
                startTime: session.startTime,
                roomName: '', // TODO: get room name
            })),
        );

        return {
            cinemaName: cinema.name,
            sessions: sessionsWithFilmTitles,
        };
    }
}
