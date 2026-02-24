import { Injectable } from '@nestjs/common';
import { IRoomRepository } from '../../../domain/repositories/room.repository';
import { PrismaService } from '../../../prisma.service';
import { Room } from '../../../domain/entities/room.entity';
import { RoomMapper } from '../prisma/mappers/room.mapper';

@Injectable()
export class PrismaRoomRepository implements IRoomRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<Room | null> {
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: { seats: true },
        });

        return room ? RoomMapper.toDomain(room) : null;
    }

    async findByCinemaId(cinemaId: string): Promise<Room[]> {
        const rooms = await this.prisma.room.findMany({
            where: { cinemaId },
            include: { seats: true },
        });

        return rooms.map((room) => RoomMapper.toDomain(room));
    }
}
