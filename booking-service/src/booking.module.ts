import { Module } from '@nestjs/common'
import { BOOKING_REPOSITORY } from './domain/repositories/IBookingRepository'
import { BookingPrismaRepository } from './infrastructure/database/repositories/booking.prisma.repository'
import { PrismaModule } from './infrastructure/database/prisma.module'
import { CreateBookingUseCase } from './application/use-cases/create-booking.usecase'
import { ConfirmBookingUseCase } from './application/use-cases/confirm-booking.usecase'
import { CancelBookingUseCase } from './application/use-cases/cancel-booking.usecase'
import { GetBookingUseCase } from './application/use-cases/get-booking.usecase'
import { BookingController } from './presentation/controllers/booking.controller'

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [
    { provide: BOOKING_REPOSITORY, useClass: BookingPrismaRepository },
    CreateBookingUseCase,
    ConfirmBookingUseCase,
    CancelBookingUseCase,
    GetBookingUseCase,
  ],
})
export class BookingModule {}
