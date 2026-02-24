import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';

import { UnauthorizedCinemaAccessException } from '../../domain/exceptions/unauthorized-cinema-access.exception';
import { SessionNotFoundException } from '../../domain/exceptions/session-not-found.exception';
import { SessionConflictException } from '../../domain/exceptions/session-conflict.exception';
import { SeatsAlreadyOccupiedException } from '../../domain/exceptions/seats-already-occupied.exception';
import { RoomNotFoundException } from '../../domain/exceptions/room-not-found.exception';
import { CinemaNotFoundException } from '../../domain/exceptions/cinema-not-found.exception';
import { FilmNotFoundException } from '../../domain/exceptions/film-not-found.exception';
import {SeatsNotFoundException} from "../../domain/exceptions/seats-not-found.exception";

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(DomainExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            return response.status(status).json(exceptionResponse);
        }

        const { status, message } = this.mapExceptionToHttpResponse(exception);

        if (
            status === HttpStatus.INTERNAL_SERVER_ERROR &&
            exception instanceof Error
        ) {
            this.logger.error(
                `Unhandled exception: ${exception.message}`,
                exception.stack,
            );
        }

        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
        });
    }

    private mapExceptionToHttpResponse(exception: unknown): {
        status: HttpStatus;
        message: string;
    } {
        if (exception instanceof SessionNotFoundException) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: 'Session not found',
            };
        }

        if (exception instanceof RoomNotFoundException) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: 'Room not found',
            };
        }

        if (exception instanceof CinemaNotFoundException) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: 'Cinema not found',
            };
        }

        if (exception instanceof UnauthorizedCinemaAccessException) {
            return {
                status: HttpStatus.FORBIDDEN,
                message: 'Access to this resource is forbidden',
            };
        }

        if (exception instanceof SessionConflictException) {
            return {
                status: HttpStatus.CONFLICT,
                message: 'Time slot is already occupied',
            };
        }

        if (exception instanceof SeatsAlreadyOccupiedException) {
            return {
                status: HttpStatus.CONFLICT,
                message: 'One or more seats are already occupied',
            };
        }

        if (exception instanceof SeatsNotFoundException) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: 'One or more seats cannot be found on this room',
            };
        }

        if (exception instanceof FilmNotFoundException) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: 'Film not found',
            };
        }

        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
        };
    }
}
