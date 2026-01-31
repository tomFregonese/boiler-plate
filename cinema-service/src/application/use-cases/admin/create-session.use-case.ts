import { Inject, Injectable } from '@nestjs/common';
import { IRoomRepository } from '../../../domain/repositories/room.repository';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { ISeatRepository } from '../../../domain/repositories/seat.repository';
import { Session } from '../../../domain/entities/session.entity';
import {
    SeatOccupation,
    OccupationStatus,
} from '../../../domain/entities/seat-occupation.entity';
import { RoomNotFoundException } from '../../../domain/exceptions/room-not-found.exception';
import { SessionConflictException } from '../../../domain/exceptions/session-conflict.exception';
import { UnauthorizedCinemaAccessException } from '../../../domain/exceptions/unauthorized-cinema-access.exception';
import {
    ROOM_REPOSITORY,
    SEAT_REPOSITORY,
    SESSION_REPOSITORY,
} from '../../../infrastructure/token';

@Injectable()
export class CreateSessionUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
        @Inject(SEAT_REPOSITORY)
        private readonly seatRepository: ISeatRepository,
    ) {}

    async execute(
        filmId: string,
        roomId: string,
        startTime: Date,
        endTime: Date,
        userCinemaId: string,
    ): Promise<Session> {
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

        if (startTime >= endTime) {
            throw new Error('Start time must be before end time');
        }

        const existingSessions =
            await this.sessionRepository.findByRoomIdAndDate(roomId, startTime);

        const hasConflict = existingSessions.some((session) => {
            return startTime < session.endTime && endTime > session.startTime;
        });

        if (hasConflict) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            throw new SessionConflictException(roomId, startTime, endTime);
        }

        const seats = await this.seatRepository.findByRoomId(roomId);
        const seatOccupations = seats.map(
            (seat) =>
                new SeatOccupation(
                    '',
                    seat.id,
                    OccupationStatus.FREE,
                    undefined,
                ),
        );

        const session = new Session(
            '',
            filmId,
            roomId,
            room.cinemaId,
            startTime,
            endTime,
            seatOccupations,
        );

        return this.sessionRepository.create(session);
    }
}
