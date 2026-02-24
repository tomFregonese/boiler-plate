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
import { GetUserBookingsUseCase } from '../../application/use-cases/get-user-bookings.usecase'
import { CreateBookingDto } from '../dtos/create-booking.dto'
import { BookingResponseDto } from '../dtos/booking-response.dto'
import { SeatAlreadyBookedError } from '../../domain/errors/SeatAlreadyBookedError'
import { BookingNotFoundError } from '../../domain/errors/BookingNotFoundError'

@ApiTags('Bookings')
@ApiHeader({ name: 'x-api-key', description: 'Internal API key (injected by the gateway)', required: true })
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly createBooking: CreateBookingUseCase,
    private readonly confirmBooking: ConfirmBookingUseCase,
    private readonly cancelBooking: CancelBookingUseCase,
    private readonly getBooking: GetBookingUseCase,
    private readonly getUserBookings: GetUserBookingsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List bookings for the current user' })
  @ApiHeader({ name: 'x-user-id', description: 'User identifier (injected by the gateway)', required: true })
  @ApiOkResponse({ description: 'List of bookings', type: [BookingResponseDto] })
  async findByUser(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new BadRequestException('Missing x-user-id header')
    }
    return this.getUserBookings.execute(userId)
  }

  @Post()
  @ApiOperation({ summary: 'Create a booking' })
  @ApiHeader({ name: 'x-user-id', description: 'User identifier (injected by the gateway)', required: true })
  @ApiBody({ type: CreateBookingDto })
  @ApiCreatedResponse({ description: 'Booking created successfully', type: BookingResponseDto })
  @ApiConflictResponse({ description: 'Seat already booked for this session' })
  @ApiBadRequestResponse({ description: 'Seats unavailable or session not found' })
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
        sessionId: dto.sessionId,
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
  @ApiOperation({ summary: 'Confirm a booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID', example: 'b1234-5678-abcd' })
  @ApiOkResponse({ description: 'Booking confirmed', type: BookingResponseDto })
  @ApiNotFoundResponse({ description: 'Booking not found' })
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
  @ApiOperation({ summary: 'Cancel a booking (releases seats in the cinema-service)' })
  @ApiParam({ name: 'id', description: 'Booking UUID', example: 'b1234-5678-abcd' })
  @ApiOkResponse({ description: 'Booking cancelled and seats released', type: BookingResponseDto })
  @ApiNotFoundResponse({ description: 'Booking not found' })
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
  @ApiOperation({ summary: 'Retrieve a booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking UUID', example: 'b1234-5678-abcd' })
  @ApiOkResponse({ description: 'Booking found', type: BookingResponseDto })
  @ApiNotFoundResponse({ description: 'Booking not found' })
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
