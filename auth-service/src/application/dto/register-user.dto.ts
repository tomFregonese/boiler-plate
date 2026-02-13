import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../domain/entities/user.entity';

export class RegisterUserDto {
  @ApiProperty({
    description: 'User\'s email address',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user account (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
    type: String,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'User\'s first name',
    example: 'John',
    type: String,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Users\'s last name',
    example: 'Doe',
    type: String,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User\'s role (default is CLIENT)',
    enum: Role,
    default: Role.CLIENT,
    example: Role.CLIENT,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Cinema ID associated with the user (if applicable)',
    example: 'cinema-uuid-123',
    type: String,
  })
  @IsOptional()
  @IsString()
  cinemaId?: string;
}
