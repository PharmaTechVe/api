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

  async findAll(skip: number, limit: number): Promise<[Product[], number]> {
    return await this.productRepository.findAndCount({
      skip: skip,
      take: limit,
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      relations: ['manufacturer', 'categories'],
    });
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

    if (updateProductDTO.manufacturerId) {
      const manufacturer = await this.manufacturerService.findOne(
        updateProductDTO.manufacturerId,
      );
      Object.assign(updateProductDTO, { manufacturer });
    }
    const updateProduct = { ...product, ...updateProductDTO };
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
