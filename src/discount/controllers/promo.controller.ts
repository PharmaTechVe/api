import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
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
  CreatePromoDTO,
  UpdatePromoDTO,
  ResponsePromoDTO,
} from '../dto/promo.dto';
import { PromoService } from '../services/promo.service';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';

@Controller('promo')
@ApiExtraModels(PaginationDTO, ResponsePromoDTO)
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PromoController {
  constructor(
    private readonly promoService: PromoService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a promo' })
  @ApiResponse({
    description: 'Successful promo creation',
    status: HttpStatus.CREATED,
    type: ResponsePromoDTO,
  })
  async create(
    @Body() createPromoDto: CreatePromoDTO,
  ): Promise<ResponsePromoDTO> {
    return await this.promoService.create(createPromoDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all promos' })
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
    description: 'Successful retrieval of promos',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponsePromoDTO) },
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
  ): Promise<PaginationDTO<ResponsePromoDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + req.path;
    const count = await this.promoService.countPromos();
    const promos = await this.promoService.findAll(page, limit);
    const { next, previous } = getPaginationUrl(baseUrl, page, limit, count);
    return { results: promos, count, next, previous };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promo by ID' })
  @ApiResponse({
    description: 'Successful retrieval of promo',
    status: HttpStatus.OK,
    type: ResponsePromoDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponsePromoDTO> {
    return await this.promoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promo by ID' })
  @ApiResponse({
    description: 'Successful update of promo',
    status: HttpStatus.OK,
    type: ResponsePromoDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePromoDto: UpdatePromoDTO,
  ): Promise<ResponsePromoDTO> {
    return await this.promoService.update(id, updatePromoDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete promo by ID' })
  @ApiResponse({
    description: 'Successful deletion of promo',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.promoService.remove(id);
  }
}
