import { InjectRepository } from '@nestjs/typeorm';
import { ProductPresentation } from '../entities/product-presentation.entity';
import { Repository } from 'typeorm';

export class ProductPresentationService {
  constructor(
    @InjectRepository(ProductPresentation)
    private productPresentationRepository: Repository<ProductPresentation>,
  ) {}

  async findByProductId(productId: string): Promise<ProductPresentation[]> {
    return this.productPresentationRepository.find({
      where: { product: { id: productId } },
      relations: ['presentation'],
    });
  }
}
