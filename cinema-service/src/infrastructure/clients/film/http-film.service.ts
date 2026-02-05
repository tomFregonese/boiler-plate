import { Injectable } from '@nestjs/common';
import {
    IFilmService,
    FilmInfo,
} from '../../../application/ports/film-service.port';
import { FilmNotFoundException } from '../../../domain/exceptions/film-not-found.exception';
import { MOCK_OMDB_DATA } from './omdb-film.mock';
import { FilmMapper } from './film-mapper';

@Injectable()
export class HttpFilmService extends IFilmService {
    async getFilmById(filmId: string): Promise<FilmInfo> {
        // TODO : Call api film service
        await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 200 + 100),
        );

        const rawMovie = MOCK_OMDB_DATA[filmId];

        if (!rawMovie) {
            throw new FilmNotFoundException(filmId);
        }

        return FilmMapper.toDomain(rawMovie);
    }
}
