import { Inject, Injectable } from '@nestjs/common';
import { IRoomRepository } from '../../../domain/repositories/room.repository';
import { Room } from '../../../domain/entities/room.entity';
import { ROOM_REPOSITORY } from '../../../infrastructure/token';

@Injectable()
export class GetCinemaRoomsUseCase {
    constructor(
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
    ) {}

    async execute(cinemaId: string): Promise<Room[]> {
        return this.roomRepository.findByCinemaId(cinemaId);
    }
}
