import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProxyService } from './proxy.service.js';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  constructor(private readonly proxyService: ProxyService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.originalUrl.split('?')[0];
    const service = this.proxyService.getServiceForPath(path);

    if (!service) {
      return next();
    }

    const proxy = this.proxyService.getProxy(service.name);

    if (!proxy) {
      return next();
    }

    proxy(req, res, next);
  }
}
