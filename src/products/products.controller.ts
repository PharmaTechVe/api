import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
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
import { ProductPresentationDTO } from './dto/product.dto';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { CreateProductDTO } from './dto/product.dto';
import { Product } from './entities/product.entity';
import { Roles } from 'src/auth/roles.decorador';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';
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
    @Pagination() pagination: PaginationQueryDTO,
    @Query('q') searchText?: string,
  ): Promise<{ data: ProductPresentationDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.productsServices.getProducts(
      page,
      limit,
      searchText,
    );
    const total = await this.productsServices.countProducts(searchText);

    return { data, total };
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
