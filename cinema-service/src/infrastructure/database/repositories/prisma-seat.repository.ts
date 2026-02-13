import { Injectable } from '@nestjs/common';
import { ISeatRepository } from '../../../domain/repositories/seat.repository';
import { PrismaService } from '../../../prisma.service';
import { Seat } from '../../../domain/entities/seat.entity';
import { SeatMapper } from '../prisma/mappers/seat.mapper';

@Injectable()
export class PrismaSeatRepository implements ISeatRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByRoomId(roomId: string): Promise<Seat[]> {
        const seats = await this.prisma.seat.findMany({
            where: { roomId },
            orderBy: [{ row: 'asc' }, { number: 'asc' }],
        });

        return seats.map((seat) => SeatMapper.toDomain(seat));
    }
}
