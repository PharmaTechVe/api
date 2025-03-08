import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { ProductDTO } from './dto/find-products.dto';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';

@Controller('product')
@ApiExtraModels(PaginationDTO, ProductDTO)
export class ProductsController {
  constructor(
    private productsServices: ProductsService,
    private configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all available products',
    description:
      'returns all available products (deletedAt is NULL). It will include their images, lots, presentations, manufacturers and categories.',
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
              items: { $ref: getSchemaPath(ProductDTO) },
            },
          },
        },
      ],
    },
  })
  async getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request,
  ) {
    const baseUrl = this.configService.get<string>('API_URL') + `${req.path}`;
    const count = await this.productsServices.countProducts();
    const { next, previous } = getPaginationUrl(baseUrl, page, limit, count);
    const products = await this.productsServices.getProducts(page, limit);
    return { products, count, next, previous };
  }
}
