import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiPropertyOptional({ description: 'New login', example: 'alice' })
  @IsOptional()
  @IsString()
  login?: string;

  @ApiPropertyOptional({ description: 'New password (min 6 chars)', example: 'newpass123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: 'User roles (admin-restricted)', example: ['ROLE_ADMIN'], type: [String] })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiPropertyOptional({ description: 'Account status', example: 'open' })
  @IsOptional()
  @IsString()
  status?: string;
}

