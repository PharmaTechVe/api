import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductListDTO } from './dto/find-products.dto';

@Controller('product')
export class ProductsController {
  constructor(private productsServices: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all available products',
    description:
      'returns all available products (deletedAt is NULL). It will include their images, lots, presentations, manufacturers and categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Products obtained correctly.',
    type: [ProductListDTO],
  })
  getProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.productsServices.getProducts(page, limit);
  }
}
