import { Controller, Get, Param, Query } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiSecurity,
} from '@nestjs/swagger';
import { CinemaResponseDto } from '../dtos/cinema/cinema-response.dto';
import { CinemaCatalogDto } from '../dtos/cinema/cinema-catalog.dto';
import { GetCinemaCatalogUseCase } from '../../application/use-cases/catalog/get-cinema-catalog.use-case';
import { ListCinemasUseCase } from '../../application/use-cases/catalog/list-cinemas.use-case';
import { GetCinemaRoomsUseCase } from '../../application/use-cases/catalog/get-cinema-rooms.use-case';

@ApiTags('cinemas')
@ApiSecurity('x-api-key')
@Controller('cinemas')
export class CinemaController {
    constructor(
        private readonly listCinemasUseCase: ListCinemasUseCase,
        private readonly getCinemaCatalogUseCase: GetCinemaCatalogUseCase,
        private readonly getCinemaRoomsUseCase: GetCinemaRoomsUseCase,
    ) {}

    @ApiOperation({ summary: 'List all cinemas' })
    @ApiQuery({
        name: 'city',
        required: false,
        description: 'Filter cinemas by city',
    })
    @ApiQuery({
        name: 'postalCode',
        required: false,
        description: 'Filter cinemas by postal code',
    })
    @ApiResponse({
        status: 200,
        description: 'List of cinemas retrieved successfully',
        type: [CinemaResponseDto],
    })
    @Get()
    async listCinemas(
        @Query('city') city?: string,
        @Query('postalCode') postalCode?: string,
    ): Promise<CinemaResponseDto[]> {
        const cinemas = await this.listCinemasUseCase.execute({
            city,
            postalCode,
        });

        return cinemas.map((cinema) => ({
            id: cinema.id,
            name: cinema.name,
            address: cinema.address,
            city: cinema.city,
            postalCode: cinema.postalCode,
            ticketPrice: cinema.ticketPrice,
        }));
    }

    @ApiOperation({
        summary: 'Get the complete catalog (schedule) of a cinema',
    })
    @ApiResponse({
        status: 200,
        description: 'Cinema catalog retrieved successfully',
        type: CinemaCatalogDto,
    })
    @ApiResponse({ status: 404, description: 'Cinema not found' })
    @Get(':id/catalog')
    async getCinemaCatalog(@Param('id') id: string) {
        const result = await this.getCinemaCatalogUseCase.execute(id);

        return {
            cinemaName: result.cinemaName,
            ticketPrice: result.ticketPrice,
            sessions: result.sessions.map((session) => ({
                sessionId: session.sessionId,
                film: session.film,
                startTime: session.startTime.toISOString(),
                roomName: session.roomName,
            })),
        };
    }

    @ApiOperation({ summary: 'Get rooms for a specific cinema' })
    @ApiResponse({
        status: 200,
        description: 'List of rooms retrieved successfully',
    })
    @Get(':id/rooms')
    async getCinemaRooms(@Param('id') id: string) {
        const rooms = await this.getCinemaRoomsUseCase.execute(id);

        return rooms.map((room) => ({
            id: room.id,
            name: room.name,
            cinemaId: room.cinemaId,
            capacity: room.seats.length,
        }));
    }
}
