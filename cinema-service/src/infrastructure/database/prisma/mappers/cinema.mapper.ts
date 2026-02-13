import type { Cinema as PrismaCinema } from '@prisma/client';
import { Cinema } from '../../../../domain/entities/cinema.entity';

export class CinemaMapper {
    static toDomain(prisma: PrismaCinema): Cinema {
        return new Cinema(
            prisma.id,
            prisma.name,
            prisma.address,
            prisma.city,
            prisma.postalCode,
        );
    }
}