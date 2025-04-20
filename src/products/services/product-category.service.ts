import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { GenericProductService } from './generic-product.service';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productService: GenericProductService,
    private readonly categoryService: CategoryService,
  ) {}

  async addCategoryToProduct(
    productId: string,
    categoryId: string,
  ): Promise<Product> {
    const product = await this.productService.findOne(productId);
    if (!product.categories) {
      product.categories = [];
    }
    const category = await this.categoryService.findOne(categoryId);
    if (product.categories.some((cat) => cat.id === category.id)) {
      throw new BadRequestException(
        `Category with id ${categoryId} already exists in product with id ${productId}`,
      );
    }
    product.categories.push(category);
    await this.productRepository.save(product);
    return product;
  }

  async removeCategoryFromProduct(
    productId: string,
    categoryId: string,
  ): Promise<void> {
    const product = await this.productService.findOne(productId);
    if (product.categories) {
      product.categories = product.categories.filter(
        (category) => category.id !== categoryId,
      );
      await this.productRepository.save(product);
      return;
    }
    throw new NotFoundException(`Category with id ${categoryId} not found`);
  }
}
