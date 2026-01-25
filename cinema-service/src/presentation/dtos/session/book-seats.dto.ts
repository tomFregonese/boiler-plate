import { ApiProperty } from '@nestjs/swagger';

export class BookSeatsDto {
    @ApiProperty({
        description: 'List of seat IDs to book',
        example: [
            '880e8400-e29b-41d4-a716-446655440000',
            '880e8400-e29b-41d4-a716-446655440001',
        ],
        type: [String],
    })
    seatIds: string[];
}
