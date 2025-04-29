import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import {
  CreateGenericProductDTO,
  UpdateGenericProductDTO,
} from '../dto/generic-product.dto';
import { ManufacturerService } from './manufacturer.service';

@Injectable()
export class GenericProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly manufacturerService: ManufacturerService,
  ) {}

  async create(createProductDTO: CreateGenericProductDTO): Promise<Product> {
    const product = this.productRepository.create(createProductDTO);
    product.manufacturer = await this.manufacturerService.findOne(
      createProductDTO.manufacturerId,
    );
    return await this.productRepository.save(product);
  }

  async countProducts(q?: string, categoryId?: string): Promise<number> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.categories', 'categories')
      .where('product.deletedAt IS NULL');

    if (q) {
      qb.andWhere('product.name ILIKE :q', { q: `%${q}%` });
    }

    if (categoryId) {
      qb.andWhere('categories.id = :categoryId', { categoryId });
    }

    return qb.getCount();
  }

  async findAll(
    page: number,
    pageSize: number,
    q?: string,
    categoryId?: string,
  ): Promise<Product[]> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.manufacturer', 'manufacturer')
      .leftJoinAndSelect('manufacturer.country', 'country')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.deletedAt IS NULL');

    if (q) {
      qb.andWhere('product.name ILIKE :q', { q: `%${q}%` });
    }

    if (categoryId) {
      qb.andWhere('categories.id = :categoryId', { categoryId });
    }

    qb.orderBy('product.priority', 'ASC')
      .addOrderBy('product.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    return qb.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['manufacturer', 'categories'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDTO: UpdateGenericProductDTO,
  ): Promise<Product> {
    const product = await this.findOne(id);

    let manufacturer = {};
    if (updateProductDTO.manufacturerId) {
      const manufacturerData = await this.manufacturerService.findOne(
        updateProductDTO.manufacturerId,
      );
      manufacturer = { manufacturer: manufacturerData };
    }
    const updateProduct = { ...product, ...updateProductDTO, ...manufacturer };
    const updatedProduct = await this.productRepository.save(updateProduct);
    return this.findOne(updatedProduct.id);
  }

  async remove(id: string): Promise<boolean> {
    const product = await this.findOne(id);
    const deleted = await this.productRepository.softDelete(product.id);
    if (!deleted.affected) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return true;
  }
}
