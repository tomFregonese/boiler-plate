import { Inject, Injectable } from '@nestjs/common';
import { ICinemaRepository } from '../../../domain/repositories/cinema.repository';
import { Cinema } from '../../../domain/entities/cinema.entity';
import { CINEMA_REPOSITORY } from '../../../infrastructure/token';

@Injectable()
export class ListCinemasUseCase {
    constructor(
        @Inject(CINEMA_REPOSITORY)
        private readonly cinemaRepository: ICinemaRepository,
    ) {}

    async execute(filters?: {
        city?: string;
        postalCode?: string;
    }): Promise<Cinema[]> {
        const normalizedFilters = filters
            ? {
                  city: filters.city
                      ? this.capitalize(filters.city)
                      : undefined,
                  postalCode: filters.postalCode,
              }
            : undefined;

        return this.cinemaRepository.findAll(normalizedFilters);
    }

    private capitalize(value: string): string {
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
}
