import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { isPublicRoute } from '../config/routes.config.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || '';
    if (!this.jwtSecret) {
      console.warn('WARNING: JWT_SECRET is not set');
    }
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.originalUrl.split('?')[0];

    if (isPublicRoute(req.method, path)) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        statusCode: 401,
        message: 'Authorization header missing',
        error: 'Unauthorized',
      });
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        statusCode: 401,
        message: 'Invalid authorization header format',
        error: 'Unauthorized',
      });
      return;
    }

    const token = parts[1];

    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;

      if (!payload.uid || !payload.login || !Array.isArray(payload.roles)) {
        res.status(401).json({
          statusCode: 401,
          message: 'Invalid token payload',
          error: 'Unauthorized',
        });
        return;
      }

      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: 'Invalid or expired token',
        error: 'Unauthorized',
      });
    }
  }
}
