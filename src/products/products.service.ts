import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import {
  CreateProductDTO,
  CreateProductResponseDTO,
} from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async countProducts(): Promise<number> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL')
      .getCount();
  }

  async getProducts(page: number, limit: number): Promise<Product[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.manufacturer', 'manufacturer')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.presentations', 'productPresentation')
      .leftJoinAndSelect('productPresentation.presentation', 'presentation')
      .where('product.deletedAt IS NULL')
      .andWhere('manufacturer.deletedAt IS NULL')
      .andWhere('images.deletedAt IS NULL')
      .andWhere('productPresentation.deletedAt IS NULL')
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
