import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Brackets,
  SelectQueryBuilder,
  Like,
  In,
  Between,
} from 'typeorm';
import { ProductPresentation } from './entities/product-presentation.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductPresentation)
    private productPresentationRepository: Repository<ProductPresentation>,
  ) {}

  private applySearchQuery(
    query: SelectQueryBuilder<ProductPresentation>,
    searchQuery?: string,
  ): SelectQueryBuilder<ProductPresentation> {
    if (!searchQuery) return query;

    return query.andWhere(
      new Brackets((qb) => {
        qb.where('LOWER(product.name) LIKE LOWER(:searchQuery)', {
          searchQuery: `%${searchQuery}%`,
        })
          .orWhere('LOWER(product.generic_name) LIKE LOWER(:searchQuery)', {
            searchQuery: `%${searchQuery}%`,
          })
          .orWhere('LOWER(manufacturer.name) LIKE LOWER(:searchQuery)', {
            searchQuery: `%${searchQuery}%`,
          });
      }),
    );
  }
  async countProducts(
    query: SelectQueryBuilder<ProductPresentation>,
  ): Promise<number> {
    return query.getCount();
  }

  /**
   *  @deprecated use getProducts instead
   */
  async getProductsOld(
    page: number,
    limit: number,
    searchQuery?: string,
    categoryIds?: string[],
    manufacturerIds?: string[],
    branchIds?: string[],
    presentationIds?: string[],
    genericProductIds?: string[],
    priceRange?: number[],
  ): Promise<{ products: ProductPresentation[]; total: number }> {
    let query = this.productPresentationRepository
      .createQueryBuilder('product_presentation')
      .innerJoinAndSelect('product_presentation.product', 'product')
      .innerJoinAndSelect('product.images', 'images')
      .innerJoinAndSelect('product.manufacturer', 'manufacturer')
      .innerJoinAndSelect('product.categories', 'categories')
      .innerJoinAndSelect('product_presentation.presentation', 'presentation')
      .leftJoin('product_presentation.inventories', 'inventories')
      .where('product_presentation.deleted_at IS NULL')
      .andWhere('product.deleted_at IS NULL')
      .andWhere('manufacturer.deleted_at IS NULL')
      .andWhere('images.deleted_at IS NULL')
      .andWhere('presentation.deleted_at IS NULL');

    query = this.applySearchQuery(query, searchQuery);

    if (categoryIds && categoryIds.length > 0) {
      query.andWhere('categories.id IN (:...categoryIds)', {
        categoryIds,
      });
    }

    if (manufacturerIds && manufacturerIds.length > 0) {
      query.andWhere('manufacturer.id IN (:...manufacturerIds)', {
        manufacturerIds,
      });
    }

    if (branchIds && branchIds.length > 0) {
      query.andWhere('inventories.branch_id IN (:...branchIds)', {
        branchIds,
      });
    }

    if (presentationIds && presentationIds.length > 0) {
      query.andWhere('presentation.id IN (:...presentationIds)', {
        presentationIds,
      });
    }

    if (genericProductIds && genericProductIds.length > 0) {
      query.andWhere('product.id IN (:...genericProductIds)', {
        genericProductIds,
      });
    }

    if (priceRange && priceRange.length === 2) {
      query.andWhere('price BETWEEN :min AND :max', {
        min: priceRange[0],
        max: priceRange[1],
      });
    }

    const total = await this.countProducts(query);

    const products = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { products, total };
  }

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
  ) {
    let where = {};
    if (searchQuery) {
      where = {
        product: [
          {
            name: Like(`%${searchQuery}%`),
            genericName: Like(`%${searchQuery}%`),
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
