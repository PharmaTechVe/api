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
  UseInterceptors,
  Query,
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
  PromoDTO,
  UpdatePromoDTO,
  ResponsePromoDTO,
  PromoQueryDTO,
  PromoListDeleteDTO,
  PromoListUpdateDTO,
} from '../dto/promo.dto';
import { PromoService } from '../services/promo.service';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';

@Controller('promo')
@ApiExtraModels(PaginationDTO, ResponsePromoDTO)
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a promo' })
  @ApiResponse({
    description: 'Successful promo creation',
    status: HttpStatus.CREATED,
    type: ResponsePromoDTO,
  })
  async create(@Body() createPromoDto: PromoDTO): Promise<ResponsePromoDTO> {
    return await this.promoService.create(createPromoDto);
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
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
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search text to filter by name',
    type: String,
  })
  @ApiQuery({
    name: 'expirationBetween',
    required: false,
    description: 'Filter by expiration date range',
    type: String,
    example: '2023-01-01,2023-12-31',
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
    @Query() pagination: PromoQueryDTO,
  ): Promise<{ data: ResponsePromoDTO[]; total: number }> {
    const { page, limit, q, expirationBetween } = pagination;
    const data = await this.promoService.findAll(
      page,
      limit,
      q,
      expirationBetween,
    );
    const total = await this.promoService.countPromos();
    return { data, total };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete promos' })
  @ApiResponse({
    description: 'Successful bulk deletion of promos',
    status: HttpStatus.NO_CONTENT,
  })
  async bulkDelete(
    @Body() promoListDeleteDTO: PromoListDeleteDTO,
  ): Promise<void> {
    await this.promoService.bulkDelete(promoListDeleteDTO.ids);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update promos' })
  @ApiResponse({
    description: 'Successful bulk update of promos',
    status: HttpStatus.NO_CONTENT,
  })
  async bulkUpdate(
    @Body() promoListUpdateDTO: PromoListUpdateDTO,
  ): Promise<void> {
    await this.promoService.bulkUpdate(
      promoListUpdateDTO.ids,
      promoListUpdateDTO.expiredAt,
    );
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
