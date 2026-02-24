import { ApiProperty } from '@nestjs/swagger';

export class CinemaResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the cinema',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id: string;

    @ApiProperty({
        description: 'Name of the cinema',
        example: 'UGC Les Halles',
    })
    name: string;

    @ApiProperty({
        description: 'Full address of the cinema',
        example: '7 Place de la Rotonde, Forum des Halles',
    })
    address: string;

    @ApiProperty({
        description: 'City where the cinema is located',
        example: 'Paris',
    })
    city: string;

    @ApiProperty({
        description: 'Postal code of the cinema',
        example: '75001',
    })
    postalCode: string;

    @ApiProperty({
        description: 'Ticket price in euros',
        example: 12.5,
    })
    ticketPrice: number;
}
