import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, ILike, Brackets } from 'typeorm';
import { ProductPresentation } from './entities/product-presentation.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductPresentation)
    private productPresentationRepository: Repository<ProductPresentation>,
  ) {}

  async getProductQueryBuilder(
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
    ids?: string[],
    withPromo?: boolean,
  ) {
    const query = this.productPresentationRepository.createQueryBuilder(
      'product_presentation',
    );
    query
      .innerJoinAndSelect('product_presentation.product', 'product')
      .innerJoinAndSelect('product.images', 'images')
      .innerJoinAndSelect('product.manufacturer', 'manufacturer')
      .innerJoinAndSelect('product.categories', 'categories')
      .innerJoinAndSelect('product_presentation.presentation', 'presentation');

    if (withPromo) {
      query.innerJoinAndSelect('product_presentation.promo', 'promo');
    } else {
      query.leftJoinAndSelect('product_presentation.promo', 'promo');
    }

    if (searchQuery) {
      query.where(
        new Brackets((qb) => {
          qb.where('product.name ILIKE :searchQuery', {
            searchQuery: `%${searchQuery}%`,
          })
            .orWhere('product.genericName ILIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            })
            .orWhere('product.description ILIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            });
        }),
      );
    }

    if (withPromo) {
      query
        .andWhere('promo.startAt <= :currentDate', {
          currentDate: new Date(),
        })
        .andWhere('promo.expiredAt >= :currentDate', {
          currentDate: new Date(),
        });
    }

    if (ids && ids.length > 0) {
      query.andWhere('product_presentation.id IN (:...ids)', { ids });
    }
    if (categoryIds && categoryIds.length > 0) {
      query.andWhere('categories.id IN (:...categoryIds)', {
        categoryIds,
      });
    }
    if (manufacturerIds && manufacturerIds.length > 0) {
      query.andWhere('product.manufacturer.id IN (:...manufacturerIds)', {
        manufacturerIds,
      });
    }
    if (branchIds && branchIds.length > 0) {
      query
        .innerJoinAndSelect('product_presentation.inventories', 'inventories')
        .andWhere('inventories.branch.id IN (:...branchIds)', { branchIds });
    }
    if (presentationIds && presentationIds.length > 0) {
      query.andWhere(
        'product_presentation.presentation.id IN (:...presentationIds)',
        {
          presentationIds,
        },
      );
    }
    if (genericProductIds && genericProductIds.length > 0) {
      query.andWhere('product.id IN (:...genericProductIds)', {
        genericProductIds,
      });
    }
    if (priceRange && priceRange.length === 2) {
      query.andWhere(
        'product_presentation.price BETWEEN :minPrice AND :maxPrice',
        {
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        },
      );
    }
    if (typeof isVisible === 'boolean') {
      query.andWhere('product_presentation.isVisible = :isVisible', {
        isVisible: isVisible,
      });
    } else {
      query.andWhere('product_presentation.isVisible = true');
    }
    query
      .orderBy('product_presentation.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [products, total] = await query.getManyAndCount();
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
    isVisible?: boolean,
    ids?: string[],
  ) {
    let where = {};
    if (searchQuery) {
      where = {
        product: [
          {
            name: ILike(`%${searchQuery}%`),
          },
        ],
      };
    }
    if (ids && ids.length > 0) {
      where = {
        ...where,
        id: In(ids),
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
        isVisible: isVisible,
      };
    } else {
      where = {
        ...where,
        isVisible: true,
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
          leftJoinAndSelect: {
            promo: 'product_presentation.promo',
          },
        },
        order: {
          createdAt: 'DESC',
        },
        where,
        skip: (page - 1) * limit,
        take: limit,
      });

    return { products, total };
  }
}
