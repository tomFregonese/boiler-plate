import { Seat } from '../entities/seat.entity';

export abstract class ISeatRepository {
    abstract findByRoomId(roomId: string): Promise<Seat[]>;
}
