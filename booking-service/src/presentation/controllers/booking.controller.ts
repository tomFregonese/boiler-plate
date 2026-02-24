import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  ConflictException,
  BadRequestException,
  Headers,
} from '@nestjs/common'
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiHeader,
  ApiBadRequestResponse,
} from '@nestjs/swagger'
import { CreateBookingUseCase } from '../../application/use-cases/create-booking.usecase'
import { ConfirmBookingUseCase } from '../../application/use-cases/confirm-booking.usecase'
import { CancelBookingUseCase } from '../../application/use-cases/cancel-booking.usecase'
import { GetBookingUseCase } from '../../application/use-cases/get-booking.usecase'
import { CreateBookingDto } from '../dtos/create-booking.dto'
import { BookingResponseDto } from '../dtos/booking-response.dto'
import { SeatAlreadyBookedError } from '../../domain/errors/SeatAlreadyBookedError'
import { BookingNotFoundError } from '../../domain/errors/BookingNotFoundError'

@ApiTags('Bookings')
@ApiHeader({ name: 'x-api-key', description: 'Clé API interne (injectée par la gateway)', required: true })
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly createBooking: CreateBookingUseCase,
    private readonly confirmBooking: ConfirmBookingUseCase,
    private readonly cancelBooking: CancelBookingUseCase,
    private readonly getBooking: GetBookingUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une réservation' })
  @ApiHeader({ name: 'x-user-id', description: 'Identifiant utilisateur (injecté par la gateway)', required: true })
  @ApiBody({ type: CreateBookingDto })
  @ApiCreatedResponse({ description: 'Réservation créée avec succès', type: BookingResponseDto })
  @ApiConflictResponse({ description: 'Siège déjà réservé pour cette session' })
  @ApiBadRequestResponse({ description: 'Sièges indisponibles ou session introuvable' })
  async create(
    @Body() dto: CreateBookingDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing x-user-id header')
    }

    try {
      return await this.createBooking.execute({
        userId,
        // DTO uses cinema-service terminology: `sessionId` corresponds to booking-service `screeningId`
        screeningId: dto.sessionId,
        seatIds: dto.seatIds,
        payment: dto.payment,
      })
    } catch (error) {
      if (error instanceof SeatAlreadyBookedError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirmer une réservation' })
  @ApiParam({ name: 'id', description: 'UUID du booking', example: 'b1234-5678-abcd' })
  @ApiOkResponse({ description: 'Réservation confirmée', type: BookingResponseDto })
  @ApiNotFoundResponse({ description: 'Réservation introuvable' })
  async confirm(@Param('id') id: string) {
    try {
      return await this.confirmBooking.execute(id)
    } catch (error) {
      if (error instanceof BookingNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Annuler une réservation (libère les sièges dans le cinema-service)' })
  @ApiParam({ name: 'id', description: 'UUID du booking', example: 'b1234-5678-abcd' })
  @ApiOkResponse({ description: 'Réservation annulée et sièges libérés', type: BookingResponseDto })
  @ApiNotFoundResponse({ description: 'Réservation introuvable' })
  async cancel(@Param('id') id: string) {
    try {
      return await this.cancelBooking.execute(id)
    } catch (error) {
      if (error instanceof BookingNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une réservation par id' })
  @ApiParam({ name: 'id', description: 'UUID du booking', example: 'b1234-5678-abcd' })
  @ApiOkResponse({ description: 'Réservation trouvée', type: BookingResponseDto })
  @ApiNotFoundResponse({ description: 'Réservation introuvable' })
  async getById(@Param('id') id: string) {
    try {
      return await this.getBooking.execute(id)
    } catch (error) {
      if (error instanceof BookingNotFoundError) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
