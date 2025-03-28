import { InjectRepository } from '@nestjs/typeorm';
import { ProductPresentation } from '../entities/product-presentation.entity';
import { CreateProductPresentationDTO } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';
import { Presentation } from '../entities/presentation.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class ProductPresentationService {
  constructor(
    @InjectRepository(ProductPresentation)
    private readonly repository: Repository<ProductPresentation>,
  ) {}

  async findOne(id: string): Promise<ProductPresentation> {
    const productPresentation = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['product', 'presentation'],
    });

    if (!productPresentation) {
      throw new NotFoundException(
        `ProductPresentation con id ${id} no encontrada`,
      );
    }

    return productPresentation;
  }

  async findByProductId(productId: string): Promise<ProductPresentation[]> {
    return this.repository.find({
      where: { product: { id: productId } },
      relations: ['presentation'],
    });
  }

  async createProductPresentation(
    product: Product,
    presentation: Presentation,
    createProductPresentationDto: CreateProductPresentationDTO,
  ): Promise<ProductPresentation> {
    const newProductPresentation = this.repository.create({
      product,
      presentation,
      price: createProductPresentationDto.price,
    });

    return this.repository.save(newProductPresentation);
  }
}
