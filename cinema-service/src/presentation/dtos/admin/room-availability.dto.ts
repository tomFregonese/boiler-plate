import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FilmInfoDto } from '../film/film-info.dto';

export class SlotInfoDto {
    @ApiProperty({
        description: 'Unique identifier of the existing session',
        example: '990e8400-e29b-41d4-a716-446655440000',
    })
    sessionId: string;

    @ApiProperty({ type: () => FilmInfoDto })
    film: FilmInfoDto;
}

export class SlotDto {
    @ApiProperty({
        description: 'Time slot (hour only)',
        enum: [10, 13, 16, 19],
        example: 10,
    })
    time: 10 | 13 | 16 | 19;

    @ApiProperty({
        description: 'Full start time in ISO 8601 UTC format',
        example: '2025-01-26T10:00:00Z',
    })
    startTime: string;

    @ApiProperty({
        description: 'Whether the slot is available for booking',
        example: true,
    })
    isAvailable: boolean;

    @ApiPropertyOptional({
        description:
            'Information about the existing session if slot is occupied',
        type: SlotInfoDto,
    })
    sessionInfo?: SlotInfoDto;
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
        description: 'Availability status of all 4 time slots',
        type: [SlotDto],
    })
    slots: SlotDto[];
}
