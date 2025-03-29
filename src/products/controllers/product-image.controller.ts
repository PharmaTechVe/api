import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from '../products.service';
import { UpdateProductImageDto } from '../dto/update-product-image.dto';
import { ProductImage } from '../entities/product-image.entity';

@Controller('product/:productId/image')
export class ProductImageController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  async getProductImages(
    @Param('productId') productId: string,
  ): Promise<ProductImage[]> {
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product.images;
  }

  @Get(':imageId')
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
