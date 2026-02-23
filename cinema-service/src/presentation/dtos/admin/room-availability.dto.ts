import { ApiProperty } from '@nestjs/swagger';
import { FilmInfoDto } from '../film/film-info.dto';

export class SessionInfoDto {
    @ApiProperty({
        description: 'Unique identifier of the session',
        example: '990e8400-e29b-41d4-a716-446655440000',
    })
    sessionId: string;

    @ApiProperty({ type: () => FilmInfoDto })
    film: FilmInfoDto;

    @ApiProperty({
        description: 'Session start time in ISO 8601 UTC format',
        example: '2025-01-26T10:00:00Z',
    })
    startTime: string;

    @ApiProperty({
        description: 'Session end time in ISO 8601 UTC format',
        example: '2025-01-26T12:30:00Z',
    })
    endTime: string;
}

export class RoomAvailabilityDto {
    @ApiProperty({
        description: 'Unique identifier of the room',
        example: 'aa0e8400-e29b-41d4-a716-446655440000',
    })
    roomId: string;

    @ApiProperty({
        description: 'Date being queried in YYYY-MM-DD format',
        example: '2025-01-26',
    })
    date: string;

    @ApiProperty({
        description: 'List of existing sessions for this room on this date',
        type: [SessionInfoDto],
    })
    sessions: SessionInfoDto[];
}
