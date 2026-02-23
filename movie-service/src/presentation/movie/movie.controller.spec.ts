import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { SearchMoviesUseCase } from '../../application/use-cases/search-movies.use-case';
import { GetMovieByIdUseCase } from '../../application/use-cases/get-movie-by-id.use-case';

describe('MovieController', () => {
  let controller: MovieController;
  const searchMoviesUseCase = { execute: jest.fn() };
  const getMovieByIdUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: SearchMoviesUseCase,
          useValue: searchMoviesUseCase,
        },
        {
          provide: GetMovieByIdUseCase,
          useValue: getMovieByIdUseCase,
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll returns search results', async () => {
    searchMoviesUseCase.execute.mockResolvedValueOnce({
      page: 1,
      totalResults: 0,
      results: [],
    });

    await expect(controller.findAll({ q: 'test' })).resolves.toEqual({
      page: 1,
      totalResults: 0,
      results: [],
    });
    expect(searchMoviesUseCase.execute).toHaveBeenCalledWith({ q: 'test' });
  });

  it('findAll rethrows HttpException from use case', async () => {
    const error = new BadRequestException('Invalid query');
    searchMoviesUseCase.execute.mockRejectedValueOnce(error);

    await expect(controller.findAll({ q: 'bad' })).rejects.toBe(error);
  });

  it('findAll wraps unknown errors as InternalServerErrorException', async () => {
    searchMoviesUseCase.execute.mockRejectedValueOnce(new Error('boom'));

    await expect(controller.findAll({ q: 'bad' })).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('findByImdbId returns movie details', async () => {
    getMovieByIdUseCase.execute.mockResolvedValueOnce({ imdbID: 'tt1234567' });

    await expect(
      controller.findByImdbId('tt1234567', 'short'),
    ).resolves.toEqual({ imdbID: 'tt1234567' });
    expect(getMovieByIdUseCase.execute).toHaveBeenCalledWith(
      'tt1234567',
      'short',
    );
  });

  it('findByImdbId rethrows HttpException from use case', async () => {
    const error = new BadRequestException('Not found');
    getMovieByIdUseCase.execute.mockRejectedValueOnce(error);

    await expect(controller.findByImdbId('tt0000001')).rejects.toBe(error);
  });

  it('findByImdbId rejects invalid imdbId format', async () => {
    await expect(controller.findByImdbId('bad-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(getMovieByIdUseCase.execute).not.toHaveBeenCalled();
  });

  it('findByImdbId rejects invalid plot value', async () => {
    await expect(
      controller.findByImdbId('tt1234567', 'invalid' as 'short' | 'full'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(getMovieByIdUseCase.execute).not.toHaveBeenCalled();
  });
});
