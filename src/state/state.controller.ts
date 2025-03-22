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
import { StateService } from './state.service';
import { CreateStateDTO, UpdateStateDTO, StateDTO } from './dto/state.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { Role } from 'src/auth/rol.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('state')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a state' })
  @ApiResponse({
    description: 'Successful state creation',
    status: HttpStatus.CREATED,
    type: StateDTO,
  })
  async create(@Body() createStateDto: CreateStateDTO): Promise<StateDTO> {
    return await this.stateService.create(createStateDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all states or filter by country ID' })
  @ApiResponse({
    description: 'Successful retrieval of states',
    status: HttpStatus.OK,
    type: [StateDTO],
  })
  async findAll(@Query('countryId') countryId?: string): Promise<StateDTO[]> {
    if (countryId) {
      return await this.stateService.findByCountryId(countryId);
    }
    return await this.stateService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get state by ID' })
  @ApiResponse({
    description: 'Successful retrieval of state',
    status: HttpStatus.OK,
    type: StateDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StateDTO> {
    return await this.stateService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update state by ID' })
  @ApiResponse({
    description: 'Successful update of state',
    status: HttpStatus.OK,
    type: StateDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateStateDto: UpdateStateDTO,
  ): Promise<StateDTO> {
    return await this.stateService.update(id, updateStateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete state by ID' })
  @ApiResponse({
    description: 'Successful deletion of state',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.stateService.remove(id);
  }
}
