import { Inject, Injectable } from '@nestjs/common';
import { IRoomRepository } from '../../../domain/repositories/room.repository';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { FilmInfo, IFilmService } from '../../ports/film-service.port';
import { RoomNotFoundException } from '../../../domain/exceptions/room-not-found.exception';
import { UnauthorizedCinemaAccessException } from '../../../domain/exceptions/unauthorized-cinema-access.exception';
import {
    FILM_SERVICE,
    ROOM_REPOSITORY,
    SESSION_REPOSITORY,
} from '../../../infrastructure/token';

export interface RoomAvailabilityResult {
    roomId: string;
    date: string;
    sessions: Array<{
        sessionId: string;
        film: FilmInfo;
        startTime: Date;
        endTime: Date;
    }>;
}

@Injectable()
export class CheckRoomAvailabilityUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
        @Inject(FILM_SERVICE)
        private readonly filmService: IFilmService,
    ) {}

    async execute(
        roomId: string,
        date: string,
        userCinemaId: string,
    ): Promise<RoomAvailabilityResult> {
        const room = await this.roomRepository.findById(roomId);
        if (!room) {
            throw new RoomNotFoundException(roomId);
        }

        if (room.cinemaId !== userCinemaId) {
            throw new UnauthorizedCinemaAccessException(
                userCinemaId,
                room.cinemaId,
            );
        }

        const targetDate = new Date(date);
        const existingSessions =
            await this.sessionRepository.findByRoomIdAndDate(
                roomId,
                targetDate,
            );

        const sessions = await Promise.all(
            existingSessions.map(async (session) => ({
                sessionId: session.id,
                film: await this.filmService.getFilmById(session.filmId),
                startTime: session.startTime,
                endTime: session.endTime,
            })),
        );

        return {
            roomId,
            date,
            sessions,
        };
    }
}
