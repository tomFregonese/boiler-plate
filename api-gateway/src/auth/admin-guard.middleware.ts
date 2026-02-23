import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { isAdminRoute } from '../config/routes.config.js';

@Injectable()
export class AdminGuardMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.originalUrl.split('?')[0];

    if (!isAdminRoute(req.method, path)) {
      return next();
    }

    if (!req.user || !req.user.roles.includes('ROLE_ADMIN')) {
      res.status(403).json({
        statusCode: 403,
        message: 'Forbidden',
        error: 'Forbidden',
      });
      return;
    }

    next();
  }
}
