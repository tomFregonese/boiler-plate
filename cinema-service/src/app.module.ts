import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CinemaController } from './presentation/controllers/cinema.controller';
import { SessionController } from './presentation/controllers/session.controller';
import { AdminController } from './presentation/controllers/admin.controller';

@Module({
    imports: [],
    controllers: [
        AppController,
        CinemaController,
        SessionController,
        AdminController,
    ],
    providers: [AppService],
})
export class AppModule {}
