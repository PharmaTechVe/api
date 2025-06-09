import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ProductPresentationDTO, ProductQueryDTO } from './dto/product.dto';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { plainToInstance } from 'class-transformer';
import { AuthGuard, CustomRequest } from 'src/auth/auth.guard';
import { RecommendationService } from 'src/recommendation/recommendation.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import { ProductPresentationListUpdateDTO } from './dto/product-presentation.dto';
import { ProductPresentationService } from './services/product-presentation.service';

@Controller('product')
@ApiExtraModels(PaginationDTO, ProductPresentationDTO)
export class ProductsController {
  constructor(
    private productsServices: ProductsService,
    private recommendationService: RecommendationService,
    private productPresentationService: ProductPresentationService,
  ) {}
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
  @ApiQuery({
    name: 'isVisible',
    required: false,
    description: 'Filter by product visibility',
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'id',
    required: false,
    description: 'Filter by product presentation ID',
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
      id,
      withPromo,
    } = pagination;
    const { products, total } =
      await this.productsServices.getProductQueryBuilder(
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
        id,
        withPromo,
      );

    return {
      data: plainToInstance(ProductPresentationDTO, products, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      total,
    };
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(PaginationInterceptor)
  @Get('recommendations')
  async getProductRecommendations(@Req() req: CustomRequest) {
    const userId = req.user.id;
    const recommendations = await this.recommendationService.recommend(userId);
    const products = await this.productsServices.getProductQueryBuilder(
      1,
      10,
      undefined,
      [],
      [],
      [],
      [],
      recommendations,
    );
    return {
      data: plainToInstance(ProductPresentationDTO, products.products, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      total: products.total,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('presentation/bulk')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update orders' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Orders updated successfully',
  })
  async bulkUpdate(
    @Body() updateProductPresentationDto: ProductPresentationListUpdateDTO,
  ): Promise<void> {
    await this.productPresentationService.bulkUpdate(
      updateProductPresentationDto.ids,
      updateProductPresentationDto.isVisible,
    );
  }
}
