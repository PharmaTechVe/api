import { InjectRepository } from '@nestjs/typeorm';
import { ProductPresentation } from '../entities/product-presentation.entity';
import { Repository } from 'typeorm';
import { CreateProductPresentationDTO } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';
import { Presentation } from '../entities/presentation.entity';

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

  async createProductPresentation(
    product: Product,
    presentation: Presentation,
    createProductPresentationDto: CreateProductPresentationDTO,
  ): Promise<ProductPresentation> {
    const newProductPresentation = this.productPresentationRepository.create({
      product,
      presentation,
      price: createProductPresentationDto.price,
    });

    return this.productPresentationRepository.save(newProductPresentation);
  }
}
