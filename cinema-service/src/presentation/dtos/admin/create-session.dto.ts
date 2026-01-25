import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
    @ApiProperty({
        description: 'Identifier of the film to screen',
        example: 'film-dune-2025',
    })
    filmId: string;

    @ApiProperty({
        description: 'Identifier of the room where the session will take place',
        example: 'aa0e8400-e29b-41d4-a716-446655440000',
    })
    roomId: string;

    @ApiProperty({
        description:
            'Start time of the session in ISO 8601 UTC format (must be on a valid slot: 10h, 13h, 16h, or 19h)',
        example: '2025-01-26T10:00:00Z',
    })
    startTime: string;
}
