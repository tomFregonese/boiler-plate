import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CinemaResponseDto } from '../dtos/cinema/cinema-response.dto';
import { CinemaCatalogDto } from '../dtos/cinema/cinema-catalog.dto';

@ApiTags('cinemas')
@Controller('cinemas')
export class CinemaController {
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
    listCinemas(
        @Query('city') city?: string,
        @Query('postalCode') postalCode?: string,
    ) {
        return [];
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
    getCinemaCatalog(@Param('id') id: string) {
        return {};
    }
}