import { ServiceConfig } from '../common/interfaces/service-config.interface.js';

export const SERVICES: ServiceConfig[] = [
  {
    name: 'auth',
    prefix: '/api/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    pathRewrite: { '^/api/auth': '' },
  },
  {
    name: 'movies',
    prefix: '/api/movies',
    target: process.env.FILMS_SERVICE_URL || 'http://localhost:3002',
    pathRewrite: { '^/api/movies': '/movie' },
  },
  {
    name: 'cinemas',
    prefix: '/api/cinemas',
    target: process.env.CINEMA_SERVICE_URL || 'http://localhost:3003',
    pathRewrite: {
      '^/api/cinemas/movies': '/movies',
      '^/api/cinemas/sessions': '/sessions',
      '^/api/cinemas/admin': '/admin',
      '^/api/cinemas': '/cinemas',
    },
  },
  {
    name: 'bookings',
    prefix: '/api/bookings',
    target: process.env.BOOKINGS_SERVICE_URL || 'http://localhost:3004',
    pathRewrite: { '^/api/bookings': '' },
  },
];
