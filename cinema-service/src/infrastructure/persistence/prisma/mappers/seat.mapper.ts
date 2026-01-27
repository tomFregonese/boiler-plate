import { Seat as PrismaSeat } from '../../../../../generated/prisma/client';
import { Seat } from '../../../../domain/entities/seat.entity';

export class SeatMapper {
    static toDomain(prisma: PrismaSeat): Seat {
        return new Seat(
            prisma.id,
            prisma.row,
            prisma.number,
            prisma.roomId,
        );
    }
}