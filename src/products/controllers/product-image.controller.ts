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
import { ProductsService } from '../products.service';
import { UpdateProductImageDto } from '../dto/product-image.dto';
import { ProductImage } from '../entities/product-image.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateProductImageDTO } from '../dto/product-image.dto';

@Controller('product/:productId/image')
export class ProductImageController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List images of the product' })
  @ApiResponse({ status: HttpStatus.OK, type: [ProductImage] })
  async getProductImages(
    @Param('productId') productId: string,
  ): Promise<ProductImage[]> {
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product.images;
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
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productsService.createProductImage(product, [
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
    const image = await this.productsService.findProductImage(
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
    @Body() updateProductImageDto: UpdateProductImageDto,
  ): Promise<ProductImage> {
    const image = await this.productsService.findProductImage(
      productId,
      imageId,
    );
    if (!image) {
      throw new NotFoundException('Product image not found');
    }
    image.url = updateProductImageDto.url ?? image.url;
    return await this.productsService.updateProductImage(image);
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
    const image = await this.productsService.findProductImage(
      productId,
      imageId,
    );
    if (!image) {
      throw new NotFoundException('Product image not found');
    }
    await this.productsService.deleteProductImage(image);
  }
}
