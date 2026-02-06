import { Injectable } from '@nestjs/common';
import { BaseHttpAdapter } from '../../common/adapters/base-http.adapter.js';

@Injectable()
export class CinemasAdapter extends BaseHttpAdapter {
  protected readonly serviceName = 'cinemas';
  protected readonly baseUrl =
    process.env.CINEMA_SERVICE_URL || 'http://localhost:3003';
}
