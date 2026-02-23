import { Injectable } from '@nestjs/common';
import { BaseHttpAdapter } from '../../common/adapters/base-http.adapter.js';

@Injectable()
export class AuthAdapter extends BaseHttpAdapter {
  protected readonly serviceName = 'auth';
  protected readonly baseUrl =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
}
