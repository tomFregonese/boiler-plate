import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CinemaResponseDto } from '../dtos/cinema/cinema-response.dto';
import { CinemaCatalogDto } from '../dtos/cinema/cinema-catalog.dto';
import { GetCinemaCatalogUseCase } from '../../application/use-cases/catalog/get-cinema-catalog.use-case';
import { ListCinemasUseCase } from '../../application/use-cases/catalog/list-cinemas.use-case';

@ApiTags('cinemas')
@Controller('cinemas')
export class CinemaController {
    constructor(
        private readonly listCinemasUseCase: ListCinemasUseCase,
        private readonly getCinemaCatalogUseCase: GetCinemaCatalogUseCase,
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
            sessions: result.sessions.map((session) => ({
                sessionId: session.sessionId,
                filmId: session.filmId,
                filmTitle: session.filmTitle,
                startTime: session.startTime.toISOString(),
                roomName: session.roomName,
            })),
        };
    }
}
