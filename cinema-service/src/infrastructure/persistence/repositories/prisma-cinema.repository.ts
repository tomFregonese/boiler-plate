import { Injectable } from '@nestjs/common';
import { ICinemaRepository } from '../../../domain/repositories/cinema.repository';
import { PrismaService } from '../../../prisma.service';
import { Cinema } from 'src/domain/entities/cinema.entity';
import { CinemaMapper } from '../prisma/mappers/cinema.mapper';

@Injectable()
export class PrismaCinemaRepository implements ICinemaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(filters?: {
        city?: string;
        postalCode?: string;
    }): Promise<Cinema[]> {
        const cinemas = await this.prisma.cinema.findMany({
            where: {
                city: filters?.city
                    ? { contains: filters.city, mode: 'insensitive' }
                    : undefined,
                postalCode: filters?.postalCode
                    ? { equals: filters.postalCode }
                    : undefined,
            },
        });

        return cinemas.map((cinema) => CinemaMapper.toDomain(cinema));
    }

    async findById(id: string): Promise<Cinema | null> {
        const cinema = await this.prisma.cinema.findUnique({
            where: { id },
        });

        return cinema ? CinemaMapper.toDomain(cinema) : null;
    }

    async findByIds(ids: string[]): Promise<Cinema[]> {
        const cinemas = await this.prisma.cinema.findMany({
            where: { id: { in: ids } },
        });

        return cinemas.map((cinema) => CinemaMapper.toDomain(cinema));
    }
}
