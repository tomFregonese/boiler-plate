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
  @ApiProperty({ example: 'stripe', description: 'Payment provider' })
  @IsString()
  provider!: string

  @ApiProperty({ example: 2400, description: 'Amount in cents' })
  @IsNumber()
  amount!: number

  @ApiProperty({ example: 'EUR', description: 'ISO 4217 currency code' })
  @IsString()
  currency!: string
}

export class CreateBookingDto {
  @ApiProperty({
    example: '880e8400-e29b-41d4-a716-446655440000',
    description: 'Session identifier (cinema-service UUID)',
  })
  @IsString()
  sessionId!: string

  @ApiProperty({
    example: ['880e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440011'],
    description: 'List of seat identifiers (cinema-service UUIDs)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  seatIds!: string[]

  @ApiPropertyOptional({
    description: 'Optional payment at booking creation',
    type: CreatePaymentDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePaymentDto)
  payment?: CreatePaymentDto
}
