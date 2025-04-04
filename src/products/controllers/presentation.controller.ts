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
  UseInterceptors,
} from '@nestjs/common';
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
  CreatePresentationDTO,
  UpdatePresentationDTO,
  ResponsePresentationDTO,
} from '../dto/presentation.dto';
import { PresentationService } from '../services/presentation.service';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';
@Controller('presentation')
@ApiExtraModels(PaginationDTO, ResponsePresentationDTO)
export class PresentationController {
  constructor(
    private readonly presentationService: PresentationService,
    private configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a presentation' })
  @ApiResponse({
    description: 'Successful presentation creation',
    status: HttpStatus.CREATED,
    type: ResponsePresentationDTO,
  })
  async create(
    @Body() createPresentationDto: CreatePresentationDTO,
  ): Promise<ResponsePresentationDTO> {
    return await this.presentationService.create(createPresentationDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @UseInterceptors(PaginationInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all presentations' })
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
    description: 'Successful retrieval of presentations',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponsePresentationDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
  ): Promise<{ data: ResponsePresentationDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.presentationService.findAll(page, limit);
    const total = await this.presentationService.countPresentations();

    return { data, total };
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get presentation by ID' })
  @ApiResponse({
    description: 'Successful retrieval of presentation',
    status: HttpStatus.OK,
    type: ResponsePresentationDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponsePresentationDTO> {
    return await this.presentationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update presentation by ID' })
  @ApiResponse({
    description: 'Successful update of presentation',
    status: HttpStatus.OK,
    type: ResponsePresentationDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePresentationDto: UpdatePresentationDTO,
  ): Promise<ResponsePresentationDTO> {
    return await this.presentationService.update(id, updatePresentationDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete presentation by ID' })
  @ApiResponse({
    description: 'Successful deletion of presentation',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.presentationService.remove(id);
  }
}
