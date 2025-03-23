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
  CreatePresentationDTO,
  UpdatePresentationDTO,
  ResponsePresentationDTO,
} from '../dto/presentation.dto';
import { PresentationService } from '../services/presentation.service';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';

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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request,
  ): Promise<PaginationDTO<ResponsePresentationDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + req.path;
    const count = await this.presentationService.countPresentations();
    const { next, previous } = getPaginationUrl(baseUrl, page, limit, count);
    const presentations = await this.presentationService.findAll(page, limit);
    return { results: presentations, count, next, previous };
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
