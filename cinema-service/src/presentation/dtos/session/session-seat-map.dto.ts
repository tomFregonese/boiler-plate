import { ApiProperty } from '@nestjs/swagger';
import { FilmInfoDto } from '../film/film-info.dto';

export class SeatDto {
    @ApiProperty({
        description: 'Unique identifier of the seat',
        example: '880e8400-e29b-41d4-a716-446655440000',
    })
    seatId: string;

    @ApiProperty({
        description: 'Column number of the seat',
        example: 12,
    })
    columnNumber: number;

    @ApiProperty({
        description: 'Current status of the seat',
        enum: ['FREE', 'OCCUPIED'],
        example: 'FREE',
    })
    status: 'FREE' | 'OCCUPIED';
}

export class RowDto {
    @ApiProperty({
        description: 'Name/letter of the row',
        example: 'G',
    })
    rowName: string;

    @ApiProperty({
        description: 'List of seats in this row',
        type: [SeatDto],
    })
    seats: SeatDto[];
}

export class SessionSeatMapDto {
    @ApiProperty({
        description: 'Unique identifier of the session',
        example: '770e8400-e29b-41d4-a716-446655440000',
    })
    sessionId: string;

    @ApiProperty({ type: FilmInfoDto })
    film: FilmInfoDto;

    @ApiProperty({ description: 'Ticket price in euros', example: 12.5 })
    ticketPrice: number;

    @ApiProperty({
        description: 'List of rows with their seats',
        type: [RowDto],
    })
    rows: RowDto[];
}
