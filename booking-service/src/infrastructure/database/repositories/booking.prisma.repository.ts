import { Injectable } from '@nestjs/common'
import { Prisma, BookingStatus as PrismaBookingStatus, PaymentStatus as PrismaPaymentStatus } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { Booking } from '../../../domain/entities/Booking'
import { Payment } from '../../../domain/entities/Payement'
import { IBookingRepository } from '../../../domain/repositories/IBookingRepository'
import { BookingStatus } from '../../../domain/value-object/BookingStatus'
import { SeatAlreadyBookedError } from '../../../domain/errors/SeatAlreadyBookedError'
import { BookingMapper } from '../mappers/booking.mapper'

@Injectable()
export class BookingPrismaRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(booking: Booking, payment?: Payment): Promise<Booking> {
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const bookingRecord = await tx.booking.create({
          data: {
            userId: booking.userId,
            sessionId: booking.sessionId,
            status: booking.status as unknown as PrismaBookingStatus,
          },
        })

        if (booking.seats.length > 0) {
          await tx.bookingSeat.createMany({
            data: booking.seats.map((seat) => ({
              bookingId: bookingRecord.id,
              sessionId: bookingRecord.sessionId,
              seatId: seat.seatId,
            })),
          })
        }

        if (payment) {
          await tx.payment.create({
            data: {
              bookingId: bookingRecord.id,
              provider: payment.provider,
              amount: payment.amount.amount,
              currency: payment.amount.currency,
              status: payment.status as unknown as PrismaPaymentStatus,
            },
          })
        }

        const full = await tx.booking.findUnique({
          where: { id: bookingRecord.id },
          include: { seats: true, payment: true },
        })

        return BookingMapper.toDomain(full!)
      })

      return created
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new SeatAlreadyBookedError()
      }
      throw error
    }
  }

  async findById(id: string): Promise<Booking | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { seats: true, payment: true },
    })

    return booking ? BookingMapper.toDomain(booking) : null
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: { seats: true, payment: true },
      orderBy: { createdAt: 'desc' },
    })

    return bookings.map(BookingMapper.toDomain)
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    try {
      const booking = await this.prisma.booking.update({
        where: { id },
        data: { status: status as unknown as PrismaBookingStatus },
        include: { seats: true, payment: true },
      })

      return BookingMapper.toDomain(booking)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null
      }
      throw error
    }
  }

  async addPayment(bookingId: string, payment: Payment): Promise<Payment> {
    const created = await this.prisma.payment.create({
      data: {
        bookingId,
        provider: payment.provider,
        amount: payment.amount.amount,
        currency: payment.amount.currency,
        status: payment.status as unknown as PrismaPaymentStatus,
      },
    })

    return new Payment(
      created.id,
      created.bookingId,
      created.provider,
      payment.amount,
      payment.status,
      created.createdAt,
      created.updatedAt,
    )
  }
}
