import { InjectRepository } from '@nestjs/typeorm';
import { ProductPresentation } from '../entities/product-presentation.entity';
import { CreateProductPresentationDTO } from '../dto/product-presentation.dto';
import { Product } from '../entities/product.entity';
import { Presentation } from '../entities/presentation.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { In, IsNull, Repository } from 'typeorm';
import { UpdateProductPresentationDTO } from '../dto/product-presentation.dto';
import { PromoService } from '../../discount/services/promo.service';

@Injectable()
export class ProductPresentationService {
  constructor(
    @InjectRepository(ProductPresentation)
    private readonly repository: Repository<ProductPresentation>,
    private readonly promoService: PromoService,
  ) {}

  async findOne(id: string): Promise<ProductPresentation> {
    const productPresentation = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['product', 'presentation', 'promo'],
    });

    if (!productPresentation) {
      throw new NotFoundException(
        `ProductPresentation con id ${id} no encontrada`,
      );
    }

    return productPresentation;
  }

  async findOneProductPresentation(
    productId: string,
    presentationId: string,
  ): Promise<ProductPresentation> {
    const productPresentation = await this.repository.findOne({
      where: {
        product: { id: productId },
        presentation: { id: presentationId },
        deletedAt: IsNull(),
      },
      relations: ['product', 'presentation', 'promo'],
    });

    if (!productPresentation) {
      throw new NotFoundException('Product presentation not found');
    }

    return productPresentation;
  }

  async findByProductId(productId: string): Promise<ProductPresentation[]> {
    return this.repository.find({
      where: {
        product: { id: productId },
        presentation: { deletedAt: IsNull() },
      },
      relations: ['presentation', 'promo'],
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
    if (createProductPresentationDto.promoId) {
      newProductPresentation.promo = await this.promoService.findOne(
        createProductPresentationDto.promoId,
      );
    }
    return this.repository.save(newProductPresentation);
  }

  async findByProductAndPresentationId(
    productId: string,
    presentationId: string,
  ): Promise<ProductPresentation | null> {
    return this.repository.findOne({
      where: {
        product: { id: productId },
        presentation: { id: presentationId },
      },
      relations: ['product', 'presentation', 'promo'],
    });
  }

  async update(
    productId: string,
    presentationId: string,
    updateProductPresentationDto: UpdateProductPresentationDTO,
  ): Promise<ProductPresentation> {
    const productPresentation = await this.findOneProductPresentation(
      productId,
      presentationId,
    );

    const updatedProductPresentation = {
      ...productPresentation,
      ...updateProductPresentationDto,
    };

    if (updateProductPresentationDto.promoId) {
      updatedProductPresentation.promo = await this.promoService.findOne(
        updateProductPresentationDto.promoId,
      );
    }
    return await this.repository.save(updatedProductPresentation);
  }

  async remove(productId: string, presentationId: string): Promise<boolean> {
    const productPresentation = await this.findOneProductPresentation(
      productId,
      presentationId,
    );
    const deleted = await this.repository.update(productPresentation.id, {
      deletedAt: new Date(),
    });
    return deleted.affected === 1;
  }

  async findByIds(ids: string[]): Promise<ProductPresentation[]> {
    return await this.repository.find({
      where: {
        id: In(ids),
        deletedAt: IsNull(),
      },
      relations: ['product', 'presentation', 'promo', 'inventories'],
    });
  }
}
