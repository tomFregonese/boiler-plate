import { Room as PrismaRoom } from '../../../../../generated/prisma/client';
import { Room } from '../../../../domain/entities/room.entity';

export class RoomMapper {
    static toDomain(prisma: PrismaRoom): Room {
        return new Room(
            prisma.id,
            prisma.name,
            prisma.cinemaId,
        );
    }
}