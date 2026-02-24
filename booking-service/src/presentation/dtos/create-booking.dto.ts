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
  @ApiProperty({
    example: '880e8400-e29b-41d4-a716-446655440000',
    description: 'Identifiant de la session (UUID du cinema-service)',
  })
  @IsString()
  sessionId!: string

  @ApiProperty({
    example: ['880e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440011'],
    description: 'Liste des identifiants de sièges (UUIDs du cinema-service)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  seatIds!: string[]

  @ApiPropertyOptional({
    description: 'Paiement optionnel à la création du booking',
    type: CreatePaymentDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePaymentDto)
  payment?: CreatePaymentDto
}
