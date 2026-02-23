import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeadersInjectionMiddleware implements NestMiddleware {
  private readonly internalApiKey: string;

  constructor() {
    this.internalApiKey = process.env.INTERNAL_API_KEY || '';
    if (!this.internalApiKey) {
      console.warn('WARNING: INTERNAL_API_KEY is not set');
    }
  }

  use(req: Request, res: Response, next: NextFunction): void {
    req.headers['x-api-key'] = this.internalApiKey;

    if (req.user) {
      req.headers['x-user-id'] = req.user.uid;
      req.headers['x-user-role'] = req.user.roles[0] || '';
    }

    next();
  }
}
