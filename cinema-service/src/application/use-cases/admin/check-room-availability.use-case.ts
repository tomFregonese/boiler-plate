import { Injectable } from '@nestjs/common';
import { IRoomRepository } from '../../../domain/repositories/room.repository';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { IFilmService } from '../../ports/film-service.port';
import { RoomNotFoundException } from '../../../domain/exceptions/room-not-found.exception';
import { UnauthorizedCinemaAccessException } from '../../../domain/exceptions/unauthorized-cinema-access';

export interface RoomAvailabilityResult {
    roomId: string;
    date: string;
    slots: Array<{
        time: 10 | 13 | 16 | 19;
        startTime: Date;
        isAvailable: boolean;
        sessionInfo?: {
            sessionId: string;
            filmTitle: string;
        };
    }>;
}

@Injectable()
export class CheckRoomAvailabilityUseCase {
    private static readonly TIME_SLOTS = [10, 13, 16, 19] as const;

    constructor(
        private readonly roomRepository: IRoomRepository,
        private readonly sessionRepository: ISessionRepository,
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
        const sessions = await this.sessionRepository.findByRoomIdAndDate(
            roomId,
            targetDate,
        );

        const slots = await Promise.all(
            CheckRoomAvailabilityUseCase.TIME_SLOTS.map(async (time) => {
                const startTime = new Date(targetDate);
                startTime.setHours(time, 0, 0, 0);

                const existingSession = sessions.find(
                    (s) => s.startTime.getHours() === time,
                );

                if (existingSession) {
                    return {
                        time,
                        startTime,
                        isAvailable: false,
                        sessionInfo: {
                            sessionId: existingSession.id,
                            filmTitle: await this.filmService.getFilmTitle(
                                existingSession.filmId,
                            ),
                        },
                    };
                }

                return {
                    time,
                    startTime,
                    isAvailable: true,
                };
            }),
        );

        return {
            roomId,
            date,
            slots,
        };
    }
}
