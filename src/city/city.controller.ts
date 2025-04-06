import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDTO, UpdateCityDTO, CityDTO } from './dto/city.dto';
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
@Controller('city')
@ApiExtraModels(PaginationDTO, CityDTO)
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a city' })
  @ApiResponse({
    description: 'Successful city creation',
    status: HttpStatus.CREATED,
    type: CityDTO,
  })
  async create(@Body() createCityDto: CreateCityDTO): Promise<CityDTO> {
    return await this.cityService.create(createCityDto);
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List all cities or filter by state ID' })
  @ApiQuery({
    name: 'stateId',
    required: false,
    description: 'Filter states by state ID',
    type: String,
  })
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
    description: 'Successful retrieval of cities',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(CityDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
    @Query('stateId') stateId?: string,
  ): Promise<{ data: CityDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.cityService.findAll(page, limit, stateId);
    const total = await this.cityService.countCities(stateId);
    return { data, total };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get city by ID' })
  @ApiResponse({
    description: 'Successful retrieval of city',
    status: HttpStatus.OK,
    type: CityDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CityDTO> {
    return await this.cityService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update city by ID' })
  @ApiResponse({
    description: 'Successful update of city',
    status: HttpStatus.OK,
    type: CityDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCityDto: UpdateCityDTO,
  ): Promise<CityDTO> {
    return await this.cityService.update(id, updateCityDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete city by ID' })
  @ApiResponse({
    description: 'Successful deletion of city',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.cityService.remove(id);
  }
}
