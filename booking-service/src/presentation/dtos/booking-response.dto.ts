import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class BookingSeatResponseDto {
  @ApiProperty({ example: 'clxyz123abc', description: 'Identifiant du seat booking' })
  id!: string

  @ApiProperty({ example: 'b1234-5678-abcd', description: 'Identifiant du booking' })
  bookingId!: string

  @ApiProperty({ example: 'sess_abc123', description: 'Identifiant de la session' })
  sessionId!: string

  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440010', description: 'Identifiant du siège' })
  seatId!: string
}

class PaymentResponseDto {
  @ApiProperty({ example: 'pay_abc123' })
  id!: string

  @ApiProperty({ example: 'b1234-5678-abcd' })
  bookingId!: string

  @ApiProperty({ example: 'stripe' })
  provider!: string

  @ApiProperty({ example: 2400, description: 'Montant en centimes' })
  amount!: number

  @ApiProperty({ example: 'EUR' })
  currency!: string

  @ApiProperty({ enum: ['PENDING', 'COMPLETED', 'FAILED'], example: 'PENDING' })
  status!: string

  @ApiProperty({ example: '2026-02-23T14:00:00.000Z' })
  createdAt!: string

  @ApiProperty({ example: '2026-02-23T14:00:00.000Z' })
  updatedAt!: string
}

export class BookingResponseDto {
  @ApiProperty({ example: 'b1234-5678-abcd', description: 'Identifiant du booking' })
  id!: string

  @ApiProperty({ example: 'user_123', description: 'Identifiant utilisateur' })
  userId!: string

  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440000', description: 'Identifiant de la session cinema' })
  sessionId!: string

  @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], example: 'PENDING' })
  status!: string

  @ApiProperty({ type: [BookingSeatResponseDto], description: 'Sièges réservés' })
  seats!: BookingSeatResponseDto[]

  @ApiPropertyOptional({ type: PaymentResponseDto, description: 'Paiement associé' })
  payment?: PaymentResponseDto

  @ApiProperty({ example: '2026-02-23T14:00:00.000Z' })
  createdAt!: string

  @ApiProperty({ example: '2026-02-23T14:00:00.000Z' })
  updatedAt!: string
}
