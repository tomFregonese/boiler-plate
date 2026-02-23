import { IsString, MinLength, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ description: 'User login', example: 'alice' })
  @IsString()
  login: string;

  @ApiProperty({ description: 'User password (min 6 chars)', example: 'alice123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'User roles', example: ['ROLE_USER'], type: [String] })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiPropertyOptional({ description: 'Account status', example: 'open' })
  @IsOptional()
  @IsString()
  status?: string;
}

