import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'User\'s email address',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
    type: String,
  })
  @IsString()
  password: string;
}
