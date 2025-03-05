import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Pagination } from 'src/utils/dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async getProducts(
    page: number,
    limit: number,
    req: Request,
  ): Promise<Pagination> {
    const count = await this.productRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL')
      .getCount();

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const protocol = req.protocol;
    const host = req.get('host');

    const baseUrl = `${protocol}://${host}${req.path}`;

    const next =
      endIndex < count ? `${baseUrl}?page=${page + 1}&pageSize=${limit}` : null;

    const previous =
      startIndex > 0 ? `${baseUrl}?page=${page - 1}&pageSize=${limit}` : null;

    // const totalPages = Math.ceil(totalItems / limit);

    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.lot', 'lot')
      .leftJoinAndSelect('product.manufacturer', 'manufacturer')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.presentations', 'productPresentation')
      .leftJoinAndSelect('productPresentation.presentation', 'presentation')
      .where('product.deletedAt IS NULL')
      .andWhere('manufacturer.deletedAt IS NULL')
      .andWhere('images.deletedAt IS NULL')
      .andWhere('lot.deletedAt IS NULL')
      .andWhere('productPresentation.deletedAt IS NULL')
      .andWhere('presentation.deletedAt IS NULL')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      results: products,
      count,
      next,
      previous,
    };
  }
}
