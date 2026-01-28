import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../../domain/repositories/session.repository';
import { PrismaService } from '../../../prisma.service';
import { Session } from '../../../domain/entities/session.entity';
import { SessionMapper } from '../prisma/mappers/session.mapper';
import {
    SeatOccupation,
    OccupationStatus,
} from '../../../domain/entities/seat-occupation.entity';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<Session | null> {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: {
                seatOccupations: true,
            },
        });

        return session ? SessionMapper.toDomain(session) : null;
    }

    async findByFilmId(filmId: string): Promise<Session[]> {
        const sessions = await this.prisma.session.findMany({
            where: { filmId },
            include: {
                seatOccupations: true,
            },
        });

        return sessions.map((session) => SessionMapper.toDomain(session));
    }

    async findByCinemaId(cinemaId: string): Promise<Session[]> {
        const sessions = await this.prisma.session.findMany({
            where: {
                room: {
                    cinemaId,
                },
            },
            include: {
                seatOccupations: true,
            },
        });

        return sessions.map((session) => SessionMapper.toDomain(session));
    }

    async findByRoomIdAndDate(roomId: string, date: Date): Promise<Session[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const sessions = await this.prisma.session.findMany({
            where: {
                roomId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                seatOccupations: true,
            },
        });

        return sessions.map((session) => SessionMapper.toDomain(session));
    }

    async create(session: Session): Promise<Session> {
        const created = await this.prisma.session.create({
            data: {
                filmId: session.filmId,
                roomId: session.roomId,
                startTime: session.startTime,
                seatOccupations: {
                    create: session.seatOccupations.map((occupation) => ({
                        seatId: occupation.seatId,
                        userId: occupation.userId,
                        status: occupation.status,
                    })),
                },
            },
            include: {
                seatOccupations: true,
            },
        });

        return SessionMapper.toDomain(created);
    }

    async save(session: Session): Promise<Session> {
        const updated = await this.prisma.session.update({
            where: { id: session.id },
            data: {
                seatOccupations: {
                    deleteMany: {},
                    create: session.seatOccupations.map((occupation) => ({
                        seatId: occupation.seatId,
                        userId: occupation.userId,
                        status: occupation.status,
                    })),
                },
            },
            include: {
                seatOccupations: true,
            },
        });

        return SessionMapper.toDomain(updated);
    }
}
