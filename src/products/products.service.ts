import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
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

  async countProducts(): Promise<number> {
    return await this.productPresentationRepository
      .createQueryBuilder('product_presentation')
      .where('product_presentation.deletedAt IS NULL')
      .getCount();
  }

  async getProducts(
    page: number,
    limit: number,
  ): Promise<ProductPresentation[]> {
    const products = await this.productPresentationRepository
      .createQueryBuilder('product_presentation')
      .leftJoinAndSelect('product_presentation.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.manufacturer', 'manufacturer')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product_presentation.presentation', 'presentation')
      .where('product_presentation.deletedAt IS NULL')
      .andWhere('product.deletedAt IS NULL')
      .andWhere('manufacturer.deletedAt IS NULL')
      .andWhere('images.deletedAt IS NULL')
      .andWhere('presentation.deletedAt IS NULL')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return products;
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
}
