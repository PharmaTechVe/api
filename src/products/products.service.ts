import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { ProductPresentation } from './entities/product-presentation.entity';
import { CreateProductDTO } from './dto/create-product.dto';
import { Manufacturer } from './entities/manufacturer.entity';
import { Category } from './entities/category.entity';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductPresentation)
    private productPresentationRepository: Repository<ProductPresentation>,

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
    categories: Category[],
  ): Promise<Product> {
    const newProduct = this.productRepository.create({
      ...createProductDto,
      manufacturer,
      categories,
    });

    const savedProduct = await this.productRepository.save(newProduct);
    return savedProduct;
  }

  async createProductImage(product: Product, images: string[]): Promise<void> {
    if (images.length) {
      const productImages = images.map((url) =>
        this.productImageRepository.create({ url, product }),
      );
      await this.productImageRepository.save(productImages);
    }
  }
}
