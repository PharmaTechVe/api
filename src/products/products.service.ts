import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { getPaginationUrl } from 'src/utils/pagination-urls';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private configService: ConfigService,
  ) {}

  async getProducts(
    page: number,
    limit: number,
    req: Request,
  ): Promise<PaginationDTO> {
    const count = await this.productRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL')
      .getCount();
    const baseUrl = this.configService.get<string>('API_URL') + `${req.path}`;
    const { next, previous } = getPaginationUrl(baseUrl, page, limit, count);

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

    return {
      results: products,
      count,
      next,
      previous,
    };
  }
}
