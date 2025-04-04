import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreatePromoDTO, UpdatePromoDTO } from '../dto/promo.dto';
import { Promo } from '../entities/promo.entity';
import { ProductPresentationService } from '../../products/services/product-presentation.service';

@Injectable()
export class PromoService {
  constructor(
    @InjectRepository(Promo)
    private readonly promoRepository: Repository<Promo>,
    private productPresentationService: ProductPresentationService,
  ) {}

  async create(createPromoDTO: CreatePromoDTO): Promise<Promo> {
    const promo = this.promoRepository.create(createPromoDTO);

    if (createPromoDTO.productPresentationId) {
      const productPresentation = await this.productPresentationService.findOne(
        createPromoDTO.productPresentationId,
      );
      promo.productPresentation = productPresentation;
    }

    return await this.promoRepository.save(promo);
  }

  async countPromos(): Promise<number> {
    return await this.promoRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  async findAll(page: number, pageSize: number): Promise<Promo[]> {
    return await this.promoRepository.find({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['productPresentation'],
    });
  }

  async findOne(id: string): Promise<Promo> {
    const promo = await this.promoRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['productPresentation'],
    });
    if (!promo) {
      throw new NotFoundException(`Promo with id ${id} not found`);
    }
    return promo;
  }

  async update(id: string, updatePromoDTO: UpdatePromoDTO): Promise<Promo> {
    const promo = await this.findOne(id);

    if (updatePromoDTO.productPresentationId) {
      const productPresentation = await this.productPresentationService.findOne(
        updatePromoDTO.productPresentationId,
      );
      promo.productPresentation = productPresentation;
    }
    const updatedPromo = { ...promo, ...updatePromoDTO };
    return this.promoRepository.save(updatedPromo);
  }

  async remove(id: string): Promise<boolean> {
    const promo = await this.findOne(id);
    const result = await this.promoRepository.update(promo.id, {
      deletedAt: new Date(),
    });
    return result.affected === 1;
  }
}
