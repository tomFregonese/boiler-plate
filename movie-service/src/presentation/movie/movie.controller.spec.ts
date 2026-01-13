import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { SearchMoviesUseCase } from '../../application/use-cases/search-movies.use-case';
import { GetMovieByIdUseCase } from '../../application/use-cases/get-movie-by-id.use-case';

describe('MovieController', () => {
  let controller: MovieController;
  const searchMoviesUseCase = {
    execute: jest.fn(),
  };
  const getMovieByIdUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
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
});
