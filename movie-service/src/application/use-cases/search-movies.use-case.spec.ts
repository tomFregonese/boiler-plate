import { Test, TestingModule } from '@nestjs/testing';
import { SearchMoviesUseCase } from './search-movies.use-case';
import {
  MOVIE_REPOSITORY,
  type MovieRepository,
} from '../../domain/repositories/movie.repository';

describe('SearchMoviesUseCase', () => {
  let useCase: SearchMoviesUseCase;
  const movieRepository: MovieRepository = {
    search: jest.fn(),
    getById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchMoviesUseCase,
        {
          provide: MOVIE_REPOSITORY,
          useValue: movieRepository,
        },
      ],
    }).compile();

    useCase = module.get<SearchMoviesUseCase>(SearchMoviesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });
});
