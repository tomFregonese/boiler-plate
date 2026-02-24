import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreatePaymentDto {
    @ApiProperty({ example: 'stripe', description: 'Payment provider' })
    provider!: string;

    @ApiProperty({ example: 2400, description: 'Amount in cents' })
    amount!: number;

    @ApiProperty({ example: 'EUR', description: 'ISO 4217 currency code' })
    currency!: string;
}

export class CreateBookingDto {
    @ApiProperty({
        example: '880e8400-e29b-41d4-a716-446655440000',
        description: 'Session identifier (cinema-service UUID)',
    })
    sessionId!: string;

    @ApiProperty({
        example: ['880e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440011'],
        description: 'List of seat identifiers (cinema-service UUIDs)',
    })
    seatIds!: string[];

    @ApiPropertyOptional({
        description: 'Optional payment at booking creation',
        type: CreatePaymentDto,
    })
    payment?: CreatePaymentDto;
}