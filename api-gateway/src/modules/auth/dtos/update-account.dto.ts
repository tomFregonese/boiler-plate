import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({ description: 'New login', example: 'alice', required: false })
  login?: string;

  @ApiProperty({
    description: 'New password',
    example: 'newpass123',
    required: false,
  })
  password?: string;

  @ApiProperty({
    description: 'User roles (ROLE_ADMIN only, admin-restricted)',
    example: ['ROLE_ADMIN'],
    required: false,
    type: [String],
  })
  roles?: string[];

  @ApiProperty({
    description: 'Account status',
    example: 'open',
    required: false,
  })
  status?: string;
}
