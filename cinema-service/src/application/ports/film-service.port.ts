export abstract class IFilmService {
    abstract getFilmTitle(filmId: string): Promise<string>;
}
