import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
  ) {}

  async createProductImage(product: Product, images: string[]): Promise<void> {
    const productImages = images.map((url) =>
      this.productImageRepository.create({ url, product }),
    );
    await this.productImageRepository.save(productImages);
  }

  async findByProductId(productId: string): Promise<ProductImage[]> {
    return this.productImageRepository.find({
      where: { product: { id: productId } },
    });
  }

  async findProductImage(productId: string, imageId: string) {
    return this.productImageRepository.findOne({
      where: {
        id: imageId,
        product: { id: productId },
      },
    });
  }

  async updateProductImage(image: ProductImage): Promise<ProductImage> {
    return this.productImageRepository.save(image);
  }

  async deleteProductImage(image: ProductImage): Promise<void> {
    await this.productImageRepository.softRemove(image);
  }
}
