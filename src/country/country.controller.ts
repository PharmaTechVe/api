import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CountryService } from './country.service';
import {
  CountryDTO,
  UpdateCountryDTO,
  CountryResponseDTO,
} from './dto/country.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';

@Controller('country')
@ApiExtraModels(PaginationDTO, CountryResponseDTO)
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a country' })
  @ApiResponse({
    description: 'Successful country creation',
    status: HttpStatus.CREATED,
    type: CountryResponseDTO,
  })
  async create(
    @Body() createCountryDto: CountryDTO,
  ): Promise<CountryResponseDTO> {
    return await this.countryService.create(createCountryDto);
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List all countries' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    description: 'Successful retrieval of countries',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(CountryResponseDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
  ): Promise<{ data: CountryResponseDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.countryService.findAll(page, limit);
    const total = await this.countryService.countCountries();
    return { data, total };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get country by ID' })
  @ApiResponse({
    description: 'Successful retrieval of country',
    status: HttpStatus.OK,
    type: CountryResponseDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CountryResponseDTO> {
    return await this.countryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update country by ID' })
  @ApiResponse({
    description: 'Successful update of country',
    status: HttpStatus.OK,
    type: CountryResponseDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCountryDto: UpdateCountryDTO,
  ): Promise<CountryResponseDTO> {
    return await this.countryService.update(id, updateCountryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete country by ID' })
  @ApiResponse({
    description: 'Successful deletion of country',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.countryService.remove(id);
  }
}
