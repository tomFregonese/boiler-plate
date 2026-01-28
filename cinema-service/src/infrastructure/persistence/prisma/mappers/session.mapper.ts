import {
    Session as PrismaSession,
    SeatOccupation as PrismaSeatOccupation,
} from '../../../../../generated/prisma/client';
import { Session } from '../../../../domain/entities/session.entity';
import {
    SeatOccupation,
    OccupationStatus,
} from '../../../../domain/entities/seat-occupation.entity';

type PrismaSessionWithOccupations = PrismaSession & {
    seatOccupations: PrismaSeatOccupation[];
};

export class SessionMapper {
    static toDomain(prisma: PrismaSessionWithOccupations): Session {
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
            prisma.startTime,
            seatOccupations,
        );
    }

    static toPrisma(domain: Session) {
        return {
            id: domain.id,
            filmId: domain.filmId,
            roomId: domain.roomId,
            startTime: domain.startTime,
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
