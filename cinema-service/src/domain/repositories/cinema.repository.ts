import { Cinema } from '../entities/cinema.entity';

export abstract class ICinemaRepository {
    abstract findAll(filters?: {
        city?: string;
        postalCode?: string;
    }): Promise<Cinema[]>;
    abstract findById(id: string): Promise<Cinema | null>;
}
