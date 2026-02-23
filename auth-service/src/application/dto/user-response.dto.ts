import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'User UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'User login', example: 'alice' })
  login: string;

  @ApiProperty({ description: 'User roles', example: ['ROLE_USER'], type: [String] })
  roles: string[];

  @ApiProperty({ description: 'Account status', example: 'open' })
  status: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
