import { ApiProperty } from '@nestjs/swagger';

export class CinemaCatalogSessionDto {
    @ApiProperty({
        description: 'Unique identifier of the session',
        example: '660e8400-e29b-41d4-a716-446655440000',
    })
    sessionId: string;

    @ApiProperty({
        description: 'Identifier of the film being screened',
        example: 'film-avatar-2025',
    })
    filmId: string;

    @ApiProperty({
        description: 'Title of the film',
        example: 'Avatar: Fire and Ash',
    })
    filmTitle: string;

    @ApiProperty({
        description: 'Start time of the session in ISO 8601 UTC format',
        example: '2025-01-26T19:00:00Z',
    })
    startTime: string;

    @ApiProperty({
        description: 'Name of the room where the session takes place',
        example: 'Salle 3',
    })
    roomName: string;
}

export class CinemaCatalogDto {
    @ApiProperty({
        description: 'Name of the cinema',
        example: 'UGC Les Halles',
    })
    cinemaName: string;

    @ApiProperty({
        description: 'List of all sessions scheduled at this cinema',
        type: [CinemaCatalogSessionDto],
    })
    sessions: CinemaCatalogSessionDto[];
}
