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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('country')
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
  @ApiOperation({ summary: 'List all countries' })
  @ApiResponse({
    description: 'Successful retrieval of countries',
    status: HttpStatus.OK,
    type: [CountryResponseDTO],
  })
  async findAll(): Promise<CountryResponseDTO[]> {
    return await this.countryService.findAll();
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
