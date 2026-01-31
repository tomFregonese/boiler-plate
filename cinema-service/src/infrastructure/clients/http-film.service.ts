import { Injectable } from '@nestjs/common';
import {
    IFilmService,
    FilmInfo,
} from '../../application/ports/film-service.port';
import {FilmNotFoundException} from "../../domain/exceptions/film-not-found.exception";

@Injectable()
export class HttpFilmService extends IFilmService {
    private readonly mockFilms: Map<string, FilmInfo> = new Map([
        [
            'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            {
                id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                title: 'Dune: Deuxième Partie',
                director: 'Denis Villeneuve',
                durationMinutes: 166,
                releaseYear: 2024,
                posterUrl:
                    'https://via.placeholder.com/500x750/8B7355/FFFFFF?text=Dune+2',
                synopsis:
                    "Paul Atréides s'unit à Chani et aux Fremen pour mener la révolte contre ceux qui ont détruit sa famille.",
            },
        ],
        [
            '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
            {
                id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                title: 'Oppenheimer',
                director: 'Christopher Nolan',
                durationMinutes: 180,
                releaseYear: 2023,
                posterUrl:
                    'https://via.placeholder.com/500x750/1a1a1a/FF6B35?text=Oppenheimer',
                synopsis:
                    "L'histoire de J. Robert Oppenheimer et son rôle dans le développement de la bombe atomique.",
            },
        ],
        [
            '550e8400-e29b-41d4-a716-446655440000',
            {
                id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Barbie',
                director: 'Greta Gerwig',
                durationMinutes: 114,
                releaseYear: 2023,
                posterUrl:
                    'https://via.placeholder.com/500x750/FF69B4/FFFFFF?text=Barbie',
                synopsis:
                    'Barbie et Ken découvrent le monde réel après avoir été expulsés de Barbieland.',
            },
        ],
        [
            '7c9e6679-7425-40de-944b-e07fc1f90ae7',
            {
                id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
                title: 'The Batman',
                director: 'Matt Reeves',
                durationMinutes: 176,
                releaseYear: 2022,
                posterUrl:
                    'https://via.placeholder.com/500x750/2C3E50/E74C3C?text=The+Batman',
                synopsis:
                    'Batman enquête sur une série de meurtres qui le mènent aux profondeurs corrompues de Gotham.',
            },
        ],
        [
            '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            {
                id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                title: "Avatar: La Voie de l'eau",
                director: 'James Cameron',
                durationMinutes: 192,
                releaseYear: 2022,
                posterUrl:
                    'https://via.placeholder.com/500x750/006994/FFFFFF?text=Avatar+2',
                synopsis:
                    'Jake Sully et Neytiri doivent protéger leur famille et leur peuple face à de nouvelles menaces.',
            },
        ],
        [
            '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
            {
                id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
                title: 'Top Gun: Maverick',
                director: 'Joseph Kosinski',
                durationMinutes: 130,
                releaseYear: 2022,
                posterUrl:
                    'https://via.placeholder.com/500x750/003366/FFD700?text=Top+Gun',
                synopsis:
                    'Maverick forme une nouvelle génération de pilotes pour une mission périlleuse.',
            },
        ],
        [
            '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
            {
                id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
                title: 'Spider-Man: No Way Home',
                director: 'Jon Watts',
                durationMinutes: 148,
                releaseYear: 2021,
                posterUrl:
                    'https://via.placeholder.com/500x750/DC143C/FFFFFF?text=Spider-Man',
                synopsis:
                    "Peter Parker demande l'aide du Dr Strange, créant une faille dans le multivers.",
            },
        ],
        [
            'c56a4180-65aa-42ec-a945-5fd21dec0538',
            {
                id: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
                title: 'Inception',
                director: 'Christopher Nolan',
                durationMinutes: 148,
                releaseYear: 2010,
                posterUrl:
                    'https://via.placeholder.com/500x750/34495E/ECF0F1?text=Inception',
                synopsis:
                    "Un voleur capable d'infiltrer les rêves se voit offrir une mission d'implantation d'idée.",
            },
        ],
        [
            'a3bb189e-8bf9-3888-9912-ace4e6543002',
            {
                id: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
                title: 'Interstellar',
                director: 'Christopher Nolan',
                durationMinutes: 169,
                releaseYear: 2014,
                posterUrl:
                    'https://via.placeholder.com/500x750/000814/FFC857?text=Interstellar',
                synopsis:
                    "Une équipe d'explorateurs voyage à travers un trou de ver pour sauver l'humanité.",
            },
        ],
        [
            '6ecd8c99-4036-403d-bf84-cf8400f67836',
            {
                id: '6ecd8c99-4036-403d-bf84-cf8400f67836',
                title: 'The Dark Knight',
                director: 'Christopher Nolan',
                durationMinutes: 152,
                releaseYear: 2008,
                posterUrl:
                    'https://via.placeholder.com/500x750/1C1C1C/FFFFFF?text=Dark+Knight',
                synopsis:
                    'Batman affronte le Joker, un criminel qui veut plonger Gotham dans le chaos.',
            },
        ],
        [
            '7d793037-d3ac-4c7f-8c55-b455b6b15d8f',
            {
                id: '7d793037-d3ac-4c7f-8c55-b455b6b15d8f',
                title: 'Pulp Fiction',
                director: 'Quentin Tarantino',
                durationMinutes: 154,
                releaseYear: 1994,
                posterUrl:
                    'https://via.placeholder.com/500x750/FFA500/000000?text=Pulp+Fiction',
                synopsis:
                    "Les vies de deux tueurs à gages, d'un boxeur et d'un couple de braqueurs s'entremêlent.",
            },
        ],
        [
            '8f14e45f-ceea-467a-9af0-df4c5c8c6fb2',
            {
                id: '8f14e45f-ceea-467a-9af0-df4c5c8c6fb2',
                title: 'Parasite',
                director: 'Bong Joon-ho',
                durationMinutes: 132,
                releaseYear: 2019,
                posterUrl:
                    'https://via.placeholder.com/500x750/2C2C2C/00FF00?text=Parasite',
                synopsis:
                    "Une famille pauvre s'infiltre progressivement dans la vie d'une famille riche.",
            },
        ],
        [
            '9c1234ab-5678-90ef-1234-567890abcdef',
            {
                id: '9c1234ab-5678-90ef-1234-567890abcdef',
                title: "Le Fabuleux Destin d'Amélie Poulain",
                director: 'Jean-Pierre Jeunet',
                durationMinutes: 122,
                releaseYear: 2001,
                posterUrl:
                    'https://via.placeholder.com/500x750/D4AF37/8B0000?text=Amelie',
                synopsis:
                    "Amélie décide de changer la vie de ceux qui l'entourent tout en découvrant l'amour.",
            },
        ],
        [
            'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            {
                id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                title: 'La La Land',
                director: 'Damien Chazelle',
                durationMinutes: 128,
                releaseYear: 2016,
                posterUrl:
                    'https://via.placeholder.com/500x750/4B0082/FFD700?text=La+La+Land',
                synopsis:
                    'Un pianiste de jazz et une actrice en herbe tombent amoureux à Los Angeles.',
            },
        ],
        [
            'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            {
                id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
                title: 'Gladiator',
                director: 'Ridley Scott',
                durationMinutes: 155,
                releaseYear: 2000,
                posterUrl:
                    'https://via.placeholder.com/500x750/8B4513/FFD700?text=Gladiator',
                synopsis:
                    'Un général romain trahi devient gladiateur pour venger sa famille assassinée.',
            },
        ],
        [
            'c3d4e5f6-a7b8-9012-cdef-123456789012',
            {
                id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
                title: 'Matrix',
                director: 'Lana et Lilly Wachowski',
                durationMinutes: 136,
                releaseYear: 1999,
                posterUrl:
                    'https://via.placeholder.com/500x750/00FF00/000000?text=Matrix',
                synopsis:
                    "Un hacker découvre que la réalité n'est qu'une simulation informatique.",
            },
        ],
        [
            'd4e5f6a7-b8c9-0123-def1-234567890123',
            {
                id: 'd4e5f6a7-b8c9-0123-def1-234567890123',
                title: "Le Seigneur des Anneaux: La Communauté de l'Anneau",
                director: 'Peter Jackson',
                durationMinutes: 178,
                releaseYear: 2001,
                posterUrl:
                    'https://via.placeholder.com/500x750/8B4513/FFD700?text=LOTR',
                synopsis:
                    'Un hobbit doit détruire un anneau maléfique pour sauver la Terre du Milieu.',
            },
        ],
        [
            'e5f6a7b8-c9d0-1234-ef12-345678901234',
            {
                id: 'e5f6a7b8-c9d0-1234-ef12-345678901234',
                title: 'Jurassic Park',
                director: 'Steven Spielberg',
                durationMinutes: 127,
                releaseYear: 1993,
                posterUrl:
                    'https://via.placeholder.com/500x750/228B22/FF0000?text=Jurassic+Park',
                synopsis:
                    "Un parc d'attractions peuplé de dinosaures clonés devient incontrôlable.",
            },
        ],
        [
            'f6a7b8c9-d0e1-2345-f123-456789012345',
            {
                id: 'f6a7b8c9-d0e1-2345-f123-456789012345',
                title: 'Titanic',
                director: 'James Cameron',
                durationMinutes: 194,
                releaseYear: 1997,
                posterUrl:
                    'https://via.placeholder.com/500x750/000080/FFFFFF?text=Titanic',
                synopsis:
                    "Une histoire d'amour tragique à bord du célèbre paquebot lors de son naufrage.",
            },
        ],
        [
            'a7b8c9d0-e1f2-3456-1234-567890123456',
            {
                id: 'a7b8c9d0-e1f2-3456-1234-567890123456',
                title: "Star Wars: L'Empire contre-attaque",
                director: 'Irvin Kershner',
                durationMinutes: 124,
                releaseYear: 1980,
                posterUrl:
                    'https://via.placeholder.com/500x750/000000/FFD700?text=Star+Wars',
                synopsis:
                    "Luke Skywalker s'entraîne avec Yoda pendant que ses amis sont pourchassés.",
            },
        ],
    ]);

    async getFilmById(filmId: string): Promise<FilmInfo> {
        await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 200 + 100),
        );

        const film = this.mockFilms.get(filmId);

        if (!film) {
            throw new FilmNotFoundException(filmId);
        }

        return film;
    }
}
