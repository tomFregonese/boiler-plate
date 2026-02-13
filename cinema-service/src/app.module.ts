import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CinemaController } from './presentation/controllers/cinema.controller';
import { SessionController } from './presentation/controllers/session.controller';
import { AdminController } from './presentation/controllers/admin.controller';
import { ListCinemasUseCase } from './application/use-cases/catalog/list-cinemas.use-case';
import { GetCinemaCatalogUseCase } from './application/use-cases/catalog/get-cinema-catalog.use-case';
import { GetMovieSessionsUseCase } from './application/use-cases/catalog/get-movie-sessions.use-case.';
import { GetSessionSeatMapUseCase } from './application/use-cases/catalog/get-session-seat-map.use-case';
import { BookSeatsUseCase } from './application/use-cases/booking/book-seats.use-case';
import { CheckRoomAvailabilityUseCase } from './application/use-cases/admin/check-room-availability.use-case';
import { CreateSessionUseCase } from './application/use-cases/admin/create-session.use-case';
import {
    ROOM_REPOSITORY,
    CINEMA_REPOSITORY,
    SEAT_REPOSITORY,
    SESSION_REPOSITORY,
    FILM_SERVICE,
} from './infrastructure/token';
import { PrismaCinemaRepository } from './infrastructure/database/repositories/prisma-cinema.repository';
import { PrismaSessionRepository } from './infrastructure/database/repositories/prisma-session.repository';
import { PrismaSeatRepository } from './infrastructure/database/repositories/prisma-seat.repository';
import { PrismaRoomRepository } from './infrastructure/database/repositories/prisma-room.repository';
import { PrismaService } from './prisma.service';
import { HttpFilmService } from './infrastructure/http/clients/film/http-film.service';
import { InternalAuthMiddleware } from './presentation/middlewares/internal-auth.middleware';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule.register({
            baseURL: process.env.FILMS_SERVICE_URL ?? 'http://localhost:3002',
            timeout: 5000,
        }),
    ],
    controllers: [
        AppController,
        CinemaController,
        SessionController,
        AdminController,
    ],
    providers: [
        AppService,
        PrismaService,

        // Use cases
        ListCinemasUseCase,
        GetCinemaCatalogUseCase,
        GetMovieSessionsUseCase,
        GetSessionSeatMapUseCase,
        BookSeatsUseCase,
        CheckRoomAvailabilityUseCase,
        CreateSessionUseCase,

        // Repositories with injection
        {
            provide: CINEMA_REPOSITORY,
            useClass: PrismaCinemaRepository,
        },
        {
            provide: ROOM_REPOSITORY,
            useClass: PrismaRoomRepository,
        },
        {
            provide: SESSION_REPOSITORY,
            useClass: PrismaSessionRepository,
        },
        {
            provide: SEAT_REPOSITORY,
            useClass: PrismaSeatRepository,
        },

        {
            provide: FILM_SERVICE,
            useClass: HttpFilmService,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(InternalAuthMiddleware).forRoutes('*');
    }
}
