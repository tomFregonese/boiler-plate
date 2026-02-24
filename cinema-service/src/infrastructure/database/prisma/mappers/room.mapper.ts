import { Room as PrismaRoom, Seat as PrismaSeat } from '@prisma/client';
import { Room } from '../../../../domain/entities/room.entity';

type PrismaRoomWithSeats = PrismaRoom & { seats?: PrismaSeat[] };

export class RoomMapper {
    static toDomain(prisma: PrismaRoomWithSeats): Room {
        const seatIds = (prisma.seats || []).map((s) => s.id);
        return new Room(prisma.id, prisma.name, prisma.cinemaId, seatIds);
    }
}
