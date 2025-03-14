import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import {
  CreateProductDTO,
  CreateProductResponseDTO,
} from './dto/create-product.dto';
import { ProductPresentation } from './entities/product-presentation.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductPresentation)
    private productPresentationRepository: Repository<ProductPresentation>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async countProducts(): Promise<number> {
    return await this.productPresentationRepository
      .createQueryBuilder('product_presentation')
      .where('product_presentation.deletedAt IS NULL')
      .getCount();
  }

  async getProducts(
    page: number,
    limit: number,
  ): Promise<ProductPresentation[]> {
    const products = await this.productPresentationRepository
      .createQueryBuilder('product_presentation')
      .leftJoinAndSelect('product_presentation.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.manufacturer', 'manufacturer')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product_presentation.presentation', 'presentation')
      .where('product_presentation.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .andWhere('manufacturer.deletedAt IS NULL')
      .andWhere('images.deletedAt IS NULL')
      .andWhere('presentation.deletedAt IS NULL')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return products;
  }

  async createProduct(
    product: CreateProductDTO,
  ): Promise<CreateProductResponseDTO> {
    const productCreated = await this.productRepository.save(product);
    return productCreated;
  }
}
