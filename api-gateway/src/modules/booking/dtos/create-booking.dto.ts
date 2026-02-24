import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreatePaymentDto {
    @ApiProperty({ example: 'stripe', description: 'Provider de paiement' })
    provider!: string;

    @ApiProperty({ example: 2400, description: 'Montant en centimes' })
    amount!: number;

    @ApiProperty({ example: 'EUR', description: 'Devise ISO 4217' })
    currency!: string;
}

export class CreateBookingDto {
    @ApiProperty({
        example: '880e8400-e29b-41d4-a716-446655440000',
        description: 'Identifiant de la session (UUID du cinema-service)',
    })
    sessionId!: string;

    @ApiProperty({
        example: ['880e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440011'],
        description: 'Liste des identifiants de sièges (UUIDs du cinema-service)',
    })
    seatIds!: string[];

    @ApiPropertyOptional({
        description: 'Paiement optionnel à la création du booking',
        type: CreatePaymentDto,
    })
    payment?: CreatePaymentDto;
}