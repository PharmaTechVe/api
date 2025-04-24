import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, Brackets, SelectQueryBuilder } from 'typeorm';
import { ProductPresentation } from './entities/product-presentation.entity';
import { Manufacturer } from './entities/manufacturer.entity';
import { ProductImage } from './entities/product-image.entity';
import { Presentation } from './entities/presentation.entity';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductPresentation)
    private productPresentationRepository: Repository<ProductPresentation>,

    @InjectRepository(Presentation)
    private PresentationRepository: Repository<Presentation>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Manufacturer)
    private manufacturerRepository: Repository<Manufacturer>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
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

    query.orderBy('product.priority', 'ASC');

    const total = await this.countProducts(query);

    const products = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { products, total };
  }
}
