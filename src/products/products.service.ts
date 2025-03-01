import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async getProducts(): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.lot', 'lot')
      .leftJoinAndSelect('product.manufacturer_id', 'manufacturer')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.presentations', 'productPresentation')
      .leftJoinAndSelect('productPresentation.presentation_id', 'presentation')
      .where('product.deleted_at IS NULL')
      .andWhere('productPresentation.deleted_at IS NULL')
      .andWhere('presentation.deleted_at IS NULL')
      .andWhere('manufacturer.deleted_at IS NULL')
      .andWhere('lot.deleted_at IS NULL')
      .andWhere('images.deleted_at IS NULL')
      .getMany();
  }
}
