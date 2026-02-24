import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BookingSeatResponseDto {
    @ApiProperty({ example: 'clxyz123abc', description: 'Seat booking identifier' })
    id!: string;

    @ApiProperty({ example: 'b1234-5678-abcd', description: 'Booking identifier' })
    bookingId!: string;

    @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440000', description: 'Session identifier' })
    sessionId!: string;

    @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440010', description: 'Seat identifier' })
    seatId!: string;
}

class PaymentResponseDto {
    @ApiProperty({ example: 'pay_abc123' })
    id!: string;

    @ApiProperty({ example: 'b1234-5678-abcd' })
    bookingId!: string;

    @ApiProperty({ example: 'stripe' })
    provider!: string;

    @ApiProperty({ example: 2400, description: 'Amount in cents' })
    amount!: number;

    @ApiProperty({ example: 'EUR' })
    currency!: string;

    @ApiProperty({ enum: ['PENDING', 'COMPLETED', 'FAILED'], example: 'PENDING' })
    status!: string;

    @ApiProperty({ example: '2026-02-23T14:00:00.000Z' })
    createdAt!: string;

    @ApiProperty({ example: '2026-02-23T14:00:00.000Z' })
    updatedAt!: string;
}

export class BookingResponseDto {
    @ApiProperty({ example: 'b1234-5678-abcd', description: 'Booking identifier' })
    id!: string;

    @ApiProperty({ example: 'user_123', description: 'User identifier' })
    userId!: string;

    @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440000', description: 'Cinema session identifier' })
    sessionId!: string;

    @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], example: 'PENDING' })
    status!: string;

    @ApiProperty({ type: [BookingSeatResponseDto], description: 'Booked seats' })
    seats!: BookingSeatResponseDto[];

    @ApiPropertyOptional({ type: PaymentResponseDto, description: 'Associated payment' })
    payment?: PaymentResponseDto;

    @ApiProperty({ example: '2026-02-23T14:00:00.000Z' })
    createdAt!: string;

    @ApiProperty({ example: '2026-02-23T14:00:00.000Z' })
    updatedAt!: string;
}
