import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductImage } from '../entities/product-image.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import {
  CreateProductImageDTO,
  UpdateProductImageDTO,
} from '../dto/product-image.dto';
import { ProductImageService } from '../services/product-image.service';
import { GenericProductService } from '../services/generic-product.service';

@Controller('product/:productId/image')
export class ProductImageController {
  constructor(
    private readonly genericProductService: GenericProductService,
    private readonly productImageService: ProductImageService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List images of the product' })
  @ApiResponse({ status: HttpStatus.OK, type: [ProductImage] })
  async getProductImages(
    @Param('productId') productId: string,
  ): Promise<ProductImage[]> {
    const images = await this.productImageService.findByProductId(productId);
    return images;
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new image for the product' })
  @ApiResponse({ status: HttpStatus.CREATED })
  async createProductImage(
    @Param('productId') productId: string,
    @Body() createProductImageDto: CreateProductImageDTO,
  ): Promise<void> {
    const product = await this.genericProductService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productImageService.createProductImage(product, [
      createProductImageDto.url,
    ]);
  }

  @Get(':imageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get details of a specific image',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [ProductImage] })
  async getProductImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<ProductImage> {
    const image = await this.productImageService.findProductImage(
      productId,
      imageId,
    );
    if (!image) {
      throw new NotFoundException('Product image not found');
    }
    return image;
  }

  @Patch(':imageId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an image partially' })
  @ApiResponse({ status: HttpStatus.OK, type: ProductImage })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async updateProductImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @Body() updateProductImageDto: UpdateProductImageDTO,
  ): Promise<ProductImage> {
    const image = await this.productImageService.findProductImage(
      productId,
      imageId,
    );
    if (!image) {
      throw new NotFoundException('Product image not found');
    }
    image.url = updateProductImageDto.url ?? image.url;
    return await this.productImageService.updateProductImage(image);
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete (soft delete) an image',
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async deleteProductImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<void> {
    const image = await this.productImageService.findProductImage(
      productId,
      imageId,
    );
    if (!image) {
      throw new NotFoundException('Product image not found');
    }
    await this.productImageService.deleteProductImage(image);
  }
}
