import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreatePromoDTO, UpdatePromoDTO } from '../dto/promo.dto';
import { Promo } from '../entities/promo.entity';

@Injectable()
export class PromoService {
  constructor(
    @InjectRepository(Promo)
    private readonly promoRepository: Repository<Promo>,
  ) {}

  async create(createPromoDTO: CreatePromoDTO): Promise<Promo> {
    const promo = this.promoRepository.create(createPromoDTO);

    return await this.promoRepository.save(promo);
  }

  async countPromos(): Promise<number> {
    return await this.promoRepository.count({
      where: { deleted_at: IsNull() },
    });
  }

  async findAll(page: number, pageSize: number): Promise<Promo[]> {
    return await this.promoRepository.find({
      where: { deleted_at: IsNull() },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['productPresentation'],
    });
  }

  async findOne(id: string): Promise<Promo> {
    const promo = await this.promoRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['productPresentation'],
    });
    if (!promo) {
      throw new NotFoundException(`Promo con id ${id} no encontrada`);
    }
    return promo;
  }

  async update(id: string, updatePromoDTO: UpdatePromoDTO): Promise<Promo> {
    const promo = await this.findOne(id);

    if (updatePromoDTO.productPresentationId) {
      promo.productPresentationId = updatePromoDTO.productPresentationId;
    }
    Object.assign(promo, updatePromoDTO);
    return await this.promoRepository.save(promo);
  }

  async remove(id: string): Promise<boolean> {
    const promo = await this.findOne(id);
    const result = await this.promoRepository.update(promo.id, {
      deleted_at: new Date(),
    });
    return result.affected === 1;
  }
}
