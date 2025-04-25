import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { ProductPresentationDTO, ProductQueryDTO } from './dto/product.dto';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';

@Controller('product')
@ApiExtraModels(PaginationDTO, ProductPresentationDTO)
export class ProductsController {
  constructor(private productsServices: ProductsService) {}
  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({
    summary: 'List all available products',
    description:
      'returns all available products (deletedAt is NULL). It will include their images, lots, presentations, manufacturers and categories.',
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
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Search text to filter by name, generic_name or manufacturer.name',
    type: String,
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
    type: String,
    example:
      '123e4567-e89b-12d3-a456-426614174000,123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter by branch ID',
    type: String,
  })
  @ApiQuery({
    name: 'manufacturerId',
    required: false,
    description: 'Filter by manufacturer ID',
    type: String,
  })
  @ApiQuery({
    name: 'presentationId',
    required: false,
    description: 'Filter by presentation ID',
    type: String,
  })
  @ApiQuery({
    name: 'genericProductId',
    required: false,
    description: 'Filter by generic product ID',
    type: String,
  })
  @ApiQuery({
    name: 'rangePrice',
    required: false,
    description: 'Filter by price range',
    type: String,
    example: '100,200',
  })
  @ApiOkResponse({
    description: 'Products obtained correctly.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ProductPresentationDTO) },
            },
          },
        },
      ],
    },
  })
  async getProducts(
    @Query() pagination: ProductQueryDTO,
  ): Promise<{ data: ProductPresentationDTO[]; total: number }> {
    const {
      page,
      limit,
      q,
      categoryId,
      branchId,
      manufacturerId,
      presentationId,
      genericProductId,
      priceRange,
      isVisible,
    } = pagination;
    const { products, total } = await this.productsServices.getProducts(
      page,
      limit,
      q,
      categoryId,
      manufacturerId,
      branchId,
      presentationId,
      genericProductId,
      priceRange,
      isVisible,
    );

    return { data: products, total };
  }
}
