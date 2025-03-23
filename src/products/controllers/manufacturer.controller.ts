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
  HttpCode,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
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
import {
  CreateManufacturerDTO,
  UpdateManufacturerDTO,
  ResponseManufacturerDTO,
} from '../dto/manufacturer.dto';
import { ManufacturerService } from '../services/manufacturer.service';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';
@Controller('manufacturer')
@ApiExtraModels(PaginationDTO, ResponseManufacturerDTO)
export class ManufacturerController {
  constructor(
    private readonly manufacturerService: ManufacturerService,
    private configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a manufacturer' })
  @ApiResponse({
    description: 'Successful manufacturer creation',
    status: HttpStatus.CREATED,
    type: ResponseManufacturerDTO,
  })
  async create(
    @Body() createManufacturerDto: CreateManufacturerDTO,
  ): Promise<ResponseManufacturerDTO> {
    return await this.manufacturerService.create(createManufacturerDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all manufacturers' })
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
    description: 'Successful retrieval of manufacturers',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponseManufacturerDTO) },
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
  ): Promise<PaginationDTO<ResponseManufacturerDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + `${req.path}`;
    const count = await this.manufacturerService.countManufacturers();
    const manufacturers = await this.manufacturerService.findAll(page, limit);
    const { next, previous } = getPaginationUrl(baseUrl, page, limit, count);
    return { results: manufacturers, count, next, previous };
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get manufacturer by ID' })
  @ApiResponse({
    description: 'Successful retrieval of manufacturer',
    status: HttpStatus.OK,
    type: ResponseManufacturerDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseManufacturerDTO> {
    return await this.manufacturerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update manufacturer by ID' })
  @ApiResponse({
    description: 'Successful update of manufacturer',
    status: HttpStatus.OK,
    type: ResponseManufacturerDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateManufacturerDto: UpdateManufacturerDTO,
  ): Promise<ResponseManufacturerDTO> {
    return await this.manufacturerService.update(id, updateManufacturerDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete manufacturer by ID' })
  @ApiResponse({
    description: 'Successful deletion of manufacturer',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.manufacturerService.remove(id);
  }
}
