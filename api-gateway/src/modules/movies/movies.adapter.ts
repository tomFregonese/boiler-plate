import { Injectable } from '@nestjs/common';
import { BaseHttpAdapter } from '../../common/adapters/base-http.adapter.js';

@Injectable()
export class MoviesAdapter extends BaseHttpAdapter {
  protected readonly serviceName = 'movies';
  protected readonly baseUrl =
    process.env.FILMS_SERVICE_URL || 'http://localhost:3002';
}
