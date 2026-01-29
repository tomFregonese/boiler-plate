import { ApiProperty } from '@nestjs/swagger';

export class FilmInfoDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty({ required: false })
    director?: string;

    @ApiProperty({ required: false })
    durationMinutes?: number;

    @ApiProperty({ required: false })
    releaseYear?: number;

    @ApiProperty({ required: false })
    posterUrl?: string;

    @ApiProperty({ required: false })
    synopsis?: string;
}
