import {
    Session as PrismaSession,
    SeatOccupation as PrismaSeatOccupation,
} from '@prisma/client';
import { Session } from '../../../../domain/entities/session.entity';
import {
    SeatOccupation,
    OccupationStatus,
} from '../../../../domain/entities/seat-occupation.entity';
import { Room } from '@prisma/client';

type PrismaSessionWithRoomAndOccupations = PrismaSession & {
    seatOccupations: PrismaSeatOccupation[];
    room: Room;
};

export class SessionMapper {
    static toDomain(prisma: PrismaSessionWithRoomAndOccupations): Session {
        const seatOccupations = prisma.seatOccupations.map(
            (occupation) =>
                new SeatOccupation(
                    occupation.sessionId,
                    occupation.seatId,
                    occupation.status as OccupationStatus,
                    occupation.userId ?? undefined,
                ),
        );

        return new Session(
            prisma.id,
            prisma.filmId,
            prisma.roomId,
            prisma.room.cinemaId,
            prisma.startTime,
            prisma.endTime,
            seatOccupations,
            prisma.room.name,
        );
    }

    static toPrisma(
        domain: Session,
    ): Pick<
        PrismaSession,
        'id' | 'filmId' | 'roomId' | 'startTime' | 'endTime'
    > {
        return {
            id: domain.id,
            filmId: domain.filmId,
            roomId: domain.roomId,
            startTime: domain.startTime,
            endTime: domain.endTime,
        };
    }

    static seatOccupationsToPrisma(domain: Session) {
        return domain.seatOccupations.map((occupation) => ({
            sessionId: domain.id,
            seatId: occupation.seatId,
            status: occupation.status,
            userId: occupation.userId ?? null,
        }));
    }
}
