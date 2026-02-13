import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User\'s ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'User\'s email address',
    example: 'user@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.ROLE_USER,
  })
  role: Role;

  @ApiProperty({
    description: 'Associated cinema ID',
    example: 'cinema-uuid-123',
    type: String,
    nullable: true,
  })
  cinemaId: string | null;

  @ApiProperty({
    description: 'Account active status',
    example: true,
    type: Boolean,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
    type: Date,
  })
  updatedAt: Date;
}
