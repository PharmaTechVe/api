import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ProductPresentation } from './entities/product-presentation.entity';
import { CreateProductDTO } from './dto/create-product.dto';
import { Manufacturer } from './entities/manufacturer.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductPresentation)
    private productPresentationRepository: Repository<ProductPresentation>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Manufacturer)
    private manufacturerRepository: Repository<Manufacturer>,
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
}
