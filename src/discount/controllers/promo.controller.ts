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
import { PromoDTO, UpdatePromoDTO, ResponsePromoDTO } from '../dto/promo.dto';
import { PromoService } from '../services/promo.service';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';

@Controller('promo')
@ApiExtraModels(PaginationDTO, ResponsePromoDTO)
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
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
    @Pagination() pagination: PaginationQueryDTO,
  ): Promise<{ data: ResponsePromoDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.promoService.findAll(page, limit);
    const total = await this.promoService.countPromos();
    return { data, total };
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
