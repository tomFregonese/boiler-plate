import { ApiProperty } from '@nestjs/swagger';

export class MovieSessionItemDto {
    @ApiProperty({
        description: 'Unique identifier of the session',
        example: '770e8400-e29b-41d4-a716-446655440000',
    })
    sessionId: string;

    @ApiProperty({
        description: 'Start time of the session in ISO 8601 UTC format',
        example: '2025-01-26T16:00:00Z',
    })
    startTime: string;
}

export class MovieSessionProviderDto {
    @ApiProperty({
        description: 'Unique identifier of the cinema',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    cinemaId: string;

    @ApiProperty({
        description: 'Name of the cinema',
        example: 'Pathé Beaugrenelle',
    })
    cinemaName: string;

    @ApiProperty({
        description: 'List of available sessions at this cinema',
        type: [MovieSessionItemDto],
    })
    sessions: MovieSessionItemDto[];
}

export class MovieSessionsDto {
    @ApiProperty({
        description: 'Identifier of the film',
        example: 'film-avatar-2025',
    })
    filmId: string;

    @ApiProperty({
        description: 'Title of the film',
        example: 'Avatar: Fire and Ash',
    })
    filmTitle: string;

    @ApiProperty({
        description: 'List of cinemas offering this film',
        type: [MovieSessionProviderDto],
    })
    providers: MovieSessionProviderDto[];
}
