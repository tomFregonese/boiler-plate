export interface SearchMovieQuery {
  q?: string;
  type?: 'movie' | 'series' | 'episode';
  year?: string;
  page?: string;
  plot?: 'short' | 'full';
  genre?: string;
  releasedFrom?: string;
  releasedTo?: string;
  releasedOn?: string;
  minImdbRating?: string;
  maxImdbRating?: string;
  minRuntime?: string;
  maxRuntime?: string;
  director?: string;
  actor?: string;
  language?: string;
  country?: string;
  includeDetails?: string;
}
