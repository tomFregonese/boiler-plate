import { OmdbMovie } from './omdb-movie.type';
import { FilmInfo } from '../../../../application/ports/film-service.port';

export class FilmMapper {
    static toDomain(raw: OmdbMovie): FilmInfo {
        return {
            id: raw.imdbID,
            title: raw.Title,
            director: raw.Director,
            releaseYear: parseInt(raw.Year, 10),
            durationMinutes: parseInt(raw.Runtime?.split(' ')[0], 10) || 0,
            posterUrl: raw.Poster,
            synopsis: raw.Plot,
        };
    }
}
