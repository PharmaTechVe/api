import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { ProductPresentation } from './entities/product-presentation.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductPresentation)
    private productPresentationRepository: Repository<ProductPresentation>,
  ) {}

  async getProducts(
    page: number,
    limit: number,
    searchQuery?: string,
    categoryIds?: string[],
    manufacturerIds?: string[],
    branchIds?: string[],
    presentationIds?: string[],
    genericProductIds?: string[],
    priceRange?: number[],
    isVisible?: boolean,
  ) {
    let where = {};
    if (searchQuery) {
      where = {
        product: [
          {
            name: Like(`%${searchQuery}%`),
          },
        ],
      };
    }
    if (categoryIds && categoryIds.length > 0) {
      where = {
        ...where,
        product: {
          categories: {
            id: In(categoryIds),
          },
        },
      };
    }
    if (manufacturerIds && manufacturerIds.length > 0) {
      where = {
        ...where,
        product: {
          manufacturer: {
            id: In(manufacturerIds),
          },
        },
      };
    }
    if (branchIds && branchIds.length > 0) {
      where = {
        ...where,
        inventories: {
          branch: {
            id: In(branchIds),
          },
        },
      };
    }
    if (presentationIds && presentationIds.length > 0) {
      where = {
        ...where,
        presentation: {
          id: In(presentationIds),
        },
      };
    }
    if (genericProductIds && genericProductIds.length > 0) {
      where = {
        ...where,
        product: {
          id: In(genericProductIds),
        },
      };
    }
    if (priceRange && priceRange.length === 2) {
      where = {
        ...where,
        price: Between(priceRange[0], priceRange[1]),
      };
    }
    if (typeof isVisible === 'boolean') {
      where = {
        ...where,
        is_visible: isVisible,
      };
    } else {
      where = {
        ...where,
        is_visible: true,
      };
    }
    const [products, total] =
      await this.productPresentationRepository.findAndCount({
        join: {
          alias: 'product_presentation',
          innerJoinAndSelect: {
            product: 'product_presentation.product',
            images: 'product.images',
            manufacturer: 'product.manufacturer',
            categories: 'product.categories',
            presentation: 'product_presentation.presentation',
          },
        },
        where,
        skip: (page - 1) * limit,
        take: limit,
      });

    return { products, total };
  }
}
