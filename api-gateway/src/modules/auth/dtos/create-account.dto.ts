import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ description: 'User login', example: 'alice' })
  login: string;

  @ApiProperty({ description: 'User password', example: 'alice123' })
  password: string;

  @ApiProperty({
    description: 'User roles',
    example: ['ROLE_USER'],
    type: [String],
  })
  roles: string[];

  @ApiProperty({ description: 'Account status', example: 'open' })
  status: string;
}
