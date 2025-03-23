import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ProductPresentationDTO } from './dto/find-products.dto';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { CreateProductDTO } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { Roles } from 'src/auth/roles.decorador';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('product')
@ApiExtraModels(PaginationDTO, ProductPresentationDTO)
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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request,
  ): Promise<PaginationDTO<ProductPresentationDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + `${req.path}`;
    const count = await this.productsServices.countProducts();
    const { next, previous } = getPaginationUrl(baseUrl, page, limit, count);
    const products = await this.productsServices.getProducts(page, limit);
    return { results: products, count, next, previous };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Only ADMIN and BRANCH_ADMIN can create a product.',
  })
  @ApiBody({ type: CreateProductDTO })
  @ApiCreatedResponse({
    description: 'Product successfully created.',
    type: Product,
  })
  @ApiUnauthorizedResponse({ description: 'User is not authorized.' })
  async createProduct(
    @Body() createProductDto: CreateProductDTO,
  ): Promise<Product> {
    const manufacturer = await this.productsServices.findManufacturer(
      createProductDto.manufacturer,
    );

    const newProduct = await this.productsServices.createProduct(
      createProductDto,
      manufacturer,
    );

    if (createProductDto.imageUrls && createProductDto.imageUrls.length) {
      await this.productsServices.createProductImage(
        newProduct,
        createProductDto.imageUrls,
      );
    }

    if (createProductDto.categoryIds && createProductDto.categoryIds.length) {
      const categories = await this.productsServices.findCategories(
        createProductDto.categoryIds,
      );

      await this.productsServices.addCategoriesToProduct(
        newProduct,
        categories,
      );
    }

    if (
      createProductDto.presentations &&
      createProductDto.presentations.length
    ) {
      const ids = createProductDto.presentations.map((p) => p.presentationId);
      const presentations = await this.productsServices.findPresentations(ids);

      await this.productsServices.addPresentationsToProduct(
        newProduct,
        presentations,
        createProductDto.presentations,
      );
    }

    return newProduct;
  }
}
