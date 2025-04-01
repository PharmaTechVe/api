import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository, Brackets, SelectQueryBuilder, IsNull } from 'typeorm';
import { ProductPresentation } from './entities/product-presentation.entity';
import {
  CreateProductDTO,
  CreateProductPresentationDTO,
} from './dto/create-product.dto';
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
  async countProducts(searchQuery?: string): Promise<number> {
    let query = this.productPresentationRepository
      .createQueryBuilder('product_presentation')
      .leftJoin('product_presentation.product', 'product')
      .leftJoin('product.manufacturer', 'manufacturer')
      .where('product_presentation.deleted_at IS NULL')
      .andWhere('product.deleted_at IS NULL')
      .andWhere('manufacturer.deleted_at IS NULL');

    query = this.applySearchQuery(query, searchQuery);

    return query.getCount();
  }

  async getProducts(
    page: number,
    limit: number,
    searchQuery?: string,
  ): Promise<ProductPresentation[]> {
    let query = this.productPresentationRepository
      .createQueryBuilder('product_presentation')
      .leftJoinAndSelect('product_presentation.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.manufacturer', 'manufacturer')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product_presentation.presentation', 'presentation')
      .where('product_presentation.deleted_at IS NULL')
      .andWhere('product.deleted_at IS NULL')
      .andWhere('manufacturer.deleted_at IS NULL')
      .andWhere('images.deleted_at IS NULL')
      .andWhere('presentation.deleted_at IS NULL');

    query = this.applySearchQuery(query, searchQuery);

    const products = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return products;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['images'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async findManufacturer(id: string): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { id },
    });

    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }

    return manufacturer;
  }

  async findCategories(ids: string[]): Promise<Category[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const categories = await this.categoryRepository.findBy({
      id: In(ids),
    });

    if (categories.length !== ids.length) {
      throw new NotFoundException('One or more categories not found');
    }

    return categories;
  }

  async createProduct(
    createProductDto: CreateProductDTO,
    manufacturer: Manufacturer,
  ): Promise<Product> {
    const newProduct = this.productRepository.create({
      ...createProductDto,
      manufacturer,
    });

    const savedProduct = await this.productRepository.save(newProduct);
    return savedProduct;
  }

  async createProductImage(product: Product, images: string[]): Promise<void> {
    const productImages = images.map((url) =>
      this.productImageRepository.create({ url, product }),
    );
    await this.productImageRepository.save(productImages);
  }

  async addCategoriesToProduct(
    product: Product,
    categoriesToAdd: Category[],
  ): Promise<void> {
    if (categoriesToAdd.length === 0) {
      return;
    }

    if (!product.categories) {
      product.categories = [];
    }

    product.categories = [...product.categories, ...categoriesToAdd];

    await this.productRepository.save(product);
  }

  async findPresentations(ids: string[]): Promise<Presentation[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const presentations = await this.PresentationRepository.findBy({
      id: In(ids),
    });

    if (presentations.length !== ids.length) {
      throw new NotFoundException('One or more presentations not found');
    }

    return presentations;
  }

  async addPresentationsToProduct(
    product: Product,
    presentations: Presentation[],
    productPresentationDTOs: CreateProductPresentationDTO[],
  ): Promise<void> {
    if (productPresentationDTOs.length === 0) {
      return;
    }

    const productPresentations = productPresentationDTOs.map((dto) => {
      const presentation = presentations.find(
        (p) => p.id === dto.presentationId,
      );

      if (!presentation) {
        throw new NotFoundException(
          `Presentation with ID ${dto.presentationId} not found`,
        );
      }

      return this.productPresentationRepository.create({
        product,
        presentation,
        price: dto.price,
      });
    });

    await this.productPresentationRepository.save(productPresentations);
  }

  async findProductImage(productId: string, imageId: string) {
    return this.productImageRepository.findOne({
      where: {
        id: imageId,
        product: { id: productId },
      },
    });
  }

  async updateProductImage(image: ProductImage): Promise<ProductImage> {
    return this.productImageRepository.save(image);
  }

  async deleteProductImage(image: ProductImage): Promise<void> {
    await this.productImageRepository.softRemove(image);
  }
}
