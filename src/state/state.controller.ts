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
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { StateService } from './state.service';
import { CreateStateDTO, UpdateStateDTO, StateDTO } from './dto/state.dto';
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

@Controller('state')
@ApiExtraModels(PaginationDTO, StateDTO)
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List all states or filter by country ID' })
  @ApiQuery({
    name: 'countryId',
    required: false,
    description: 'Filter states by country ID',
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
    description: 'Successful retrieval of states',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(StateDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
    @Query('countryId') countryId?: string,
  ): Promise<{ data: StateDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.stateService.findAll(page, limit, countryId);
    const total = await this.stateService.countStates(countryId);
    return { data, total };
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
