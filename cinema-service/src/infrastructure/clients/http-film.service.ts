import { Injectable } from '@nestjs/common';
import { IFilmService } from '../../application/ports/film-service.port';

@Injectable()
export class HttpFilmService implements IFilmService {
    async getFilmTitle(filmId: string): Promise<string> {
        // TODO: faire un vrai call HTTP vers le microservice films
        // Pour l'instant, retourne un mock
        return `Film ${filmId}`;
    }
}
