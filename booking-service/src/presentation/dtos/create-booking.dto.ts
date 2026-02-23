import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class CreatePaymentDto {
  @ApiProperty({ example: 'stripe', description: 'Provider de paiement' })
  @IsString()
  provider!: string

  @ApiProperty({ example: 2400, description: 'Montant en centimes' })
  @IsNumber()
  amount!: number

  @ApiProperty({ example: 'EUR', description: 'Devise ISO 4217' })
  @IsString()
  currency!: string
}

export class CreateBookingDto {
  @ApiProperty({ example: 'user_123', description: 'Identifiant utilisateur' })
  @IsString()
  userId!: string

  @ApiProperty({ example: 'screening_abc', description: 'Identifiant de séance' })
  @IsString()
  screeningId!: string

  @ApiProperty({
    example: ['seat_A1', 'seat_A2'],
    description: 'Liste des identifiants de sièges',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  seatIds!: string[]

  @ApiPropertyOptional({
    description: 'Paiement optionnel à la création du booking',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePaymentDto)
  payment?: CreatePaymentDto
}
