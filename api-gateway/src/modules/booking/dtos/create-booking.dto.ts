import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreatePaymentDto {
    @ApiProperty({ example: 'stripe' })
    provider!: string;

    @ApiProperty({ example: 2400, description: 'Montant en centimes' })
    amount!: number;

    @ApiProperty({ example: 'EUR', description: 'Devise ISO 4217' })
    currency!: string;
}

export class CreateBookingDto {

    @ApiProperty({ example: 'screening_abc' })
    screeningId!: string;

    @ApiProperty({ example: ['seat_A1', 'seat_A2'] })
    seatIds!: string[];

    @ApiPropertyOptional({ description: 'Paiement optionnel a la creation' })
    payment?: CreatePaymentDto;
}