import { Injectable, Logger } from '@nestjs/common';
import {
    IFilmService,
    FilmInfo,
} from '../../../../application/ports/film-service.port';
import { FilmNotFoundException } from '../../../../domain/exceptions/film-not-found.exception';
import { FilmMapper } from './film-mapper';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OmdbMovie } from './omdb-movie.type';
import { AxiosError } from 'axios';

@Injectable()
export class HttpFilmService extends IFilmService {
    private readonly logger = new Logger(HttpFilmService.name);

    constructor(private readonly httpService: HttpService) {
        super();
    }

    async getFilmById(filmId: string): Promise<FilmInfo> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get<OmdbMovie>(`/movie/id/${filmId}`, {
                    headers: {
                        'x-api-key':
                            process.env.INTERNAL_API_KEY ?? '',
                    },
                }),
            );

            if (data.Response === 'False') {
                throw new FilmNotFoundException(filmId);
            }

            return FilmMapper.toDomain(data);
        } catch (error) {
            if (error instanceof FilmNotFoundException) {
                throw error;
            }

            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 404) {
                throw new FilmNotFoundException(filmId);
            }

            this.logger.error(
                `Failed to fetch film ${filmId}: ${axiosError.message}`,
            );
            throw error;
        }
    }
}
