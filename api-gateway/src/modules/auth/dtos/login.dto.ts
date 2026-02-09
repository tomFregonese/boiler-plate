import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User login', example: 'alice' })
  login: string;

  @ApiProperty({ description: 'User password', example: 'alice123' })
  password: string;

  @ApiProperty({ description: 'Origin of the request', example: 'web' })
  from: string;
}
