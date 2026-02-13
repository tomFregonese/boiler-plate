import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  ConflictException,
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
} from '@nestjs/swagger'
import { CreateBookingUseCase } from '../../application/use-cases/create-booking.usecase'
import { ConfirmBookingUseCase } from '../../application/use-cases/confirm-booking.usecase'
import { CancelBookingUseCase } from '../../application/use-cases/cancel-booking.usecase'
import { GetBookingUseCase } from '../../application/use-cases/get-booking.usecase'
import { CreateBookingDto } from '../dtos/create-booking.dto'
import { SeatAlreadyBookedError } from '../../domain/errors/SeatAlreadyBookedError'
import { BookingNotFoundError } from '../../domain/errors/BookingNotFoundError'

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly createBooking: CreateBookingUseCase,
    private readonly confirmBooking: ConfirmBookingUseCase,
    private readonly cancelBooking: CancelBookingUseCase,
    private readonly getBooking: GetBookingUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un booking' })
  @ApiBody({ type: CreateBookingDto })
  @ApiCreatedResponse({ description: 'Booking créé avec succès' })
  @ApiConflictResponse({ description: 'Siège déjà réservé pour la séance' })
  async create(@Body() dto: CreateBookingDto) {
    try {
      return await this.createBooking.execute(dto)
    } catch (error) {
      if (error instanceof SeatAlreadyBookedError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirmer un booking' })
  @ApiParam({ name: 'id', description: 'Identifiant du booking' })
  @ApiOkResponse({ description: 'Booking confirmé' })
  @ApiNotFoundResponse({ description: 'Booking introuvable' })
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
  @ApiOperation({ summary: 'Annuler un booking' })
  @ApiParam({ name: 'id', description: 'Identifiant du booking' })
  @ApiOkResponse({ description: 'Booking annulé' })
  @ApiNotFoundResponse({ description: 'Booking introuvable' })
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
  @ApiOperation({ summary: 'Récupérer un booking par id' })
  @ApiParam({ name: 'id', description: 'Identifiant du booking' })
  @ApiOkResponse({ description: 'Booking trouvé' })
  @ApiNotFoundResponse({ description: 'Booking introuvable' })
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
