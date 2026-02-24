import { ApiProperty } from '@nestjs/swagger';
import { FilmInfoDto } from '../film/film-info.dto';

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

    @ApiProperty({ description: 'Ticket price in euros', example: 12.5 })
    ticketPrice: number;
}

export class MovieSessionsDto {
    @ApiProperty({ type: FilmInfoDto })
    film: FilmInfoDto;

    @ApiProperty({
        description: 'List of cinemas offering this film',
        type: [MovieSessionProviderDto],
    })
    providers: MovieSessionProviderDto[];
}
