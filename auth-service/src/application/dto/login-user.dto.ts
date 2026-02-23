import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ description: 'User login', example: 'alice' })
  @IsString()
  login: string;

  @ApiProperty({ description: 'User password', example: 'alice123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Origin of the request', example: 'web' })
  @IsOptional()
  @IsString()
  from?: string;
}


