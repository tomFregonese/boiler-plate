export interface FilmInfo {
    id: string;
    title: string;
    director?: string;
    durationMinutes?: number;
    releaseYear?: number;
    posterUrl?: string;
    synopsis?: string;
}

export abstract class IFilmService {
    abstract getFilmById(filmId: string): Promise<FilmInfo>;
}
