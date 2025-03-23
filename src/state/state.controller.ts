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
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
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
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';

@Controller('state')
@ApiExtraModels(PaginationDTO, StateDTO)
export class StateController {
  constructor(
    private readonly stateService: StateService,
    private configService: ConfigService,
  ) {}

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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request,
    @Query('countryId') countryId?: string,
  ): Promise<PaginationDTO<StateDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + `${req.path}`;
    const countStates = await this.stateService.countStates(countryId);
    const states = await this.stateService.findAll(page, limit, countryId);
    const { next, previous } = getPaginationUrl(
      baseUrl,
      page,
      limit,
      countStates,
    );
    return { results: states, count: countStates, next, previous };
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
