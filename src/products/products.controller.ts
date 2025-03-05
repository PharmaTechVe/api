import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductListDTO } from './dto/find-products.dto';
import { Request } from 'express';

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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request,
  ) {
    return this.productsServices.getProducts(page, limit, req);
  }
}
