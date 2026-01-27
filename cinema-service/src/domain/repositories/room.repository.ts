import { Room } from '../entities/room.entity';

export abstract class IRoomRepository {
    abstract findById(id: string): Promise<Room | null>;
    abstract findByCinemaId(cinemaId: string): Promise<Room[]>;
}
