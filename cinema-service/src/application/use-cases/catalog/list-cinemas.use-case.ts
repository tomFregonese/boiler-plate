import { Injectable } from '@nestjs/common';
import { ICinemaRepository } from '../../../domain/repositories/cinema.repository';
import { Cinema } from '../../../domain/entities/cinema.entity';

@Injectable()
export class ListCinemasUseCase {
    constructor(private readonly cinemaRepository: ICinemaRepository) {}

    async execute(filters?: {
        city?: string;
        postalCode?: string;
    }): Promise<Cinema[]> {
        return this.cinemaRepository.findAll(filters);
    }
}
