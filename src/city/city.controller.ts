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
} from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDTO, UpdateCityDTO, CityDTO } from './dto/city.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('city')
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
  @ApiOperation({ summary: 'List all cities or filter by state ID' })
  @ApiResponse({
    description: 'Successful retrieval of cities',
    status: HttpStatus.OK,
    type: [CityDTO],
  })
  async findAll(@Query('stateId') stateId?: string): Promise<CityDTO[]> {
    if (stateId) {
      return await this.cityService.findByStateId(stateId);
    }
    return await this.cityService.findAll();
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
