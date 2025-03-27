import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProductPresentation } from '../entities/product-presentation.entity';

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
}
