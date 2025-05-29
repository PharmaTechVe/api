import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { LotService } from '../services/lot.service';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  PaginationDTO,
  PaginationQueryDTO,
} from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';
import { plainToInstance } from 'class-transformer';
import { LotQueryDTO, ResponseLotDTO } from '../dto/lot.dto';

@Controller('lot')
export class LotController {
  constructor(private readonly lotService: LotService) {}

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List all lots' })
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
    name: 'branchId',
    required: false,
    description: 'Filter by branch ID',
    type: String,
  })
  @ApiQuery({
    name: 'productPresentationId',
    required: false,
    description: 'Filter by product presentation ID',
    type: String,
  })
  @ApiResponse({
    description: 'Successful retrieval of lots',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponseLotDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
    @Query() query: LotQueryDTO,
  ): Promise<{ data: ResponseLotDTO[]; total: number }> {
    const { page, limit } = pagination;
    const [data, total] = await this.lotService.findAll(
      page,
      limit,
      query.branchId,
      query.productPresentationId,
    );
    return {
      data: plainToInstance(ResponseLotDTO, data, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      total,
    };
  }
}
