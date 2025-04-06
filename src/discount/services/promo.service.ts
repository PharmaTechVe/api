import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PromoDTO, UpdatePromoDTO } from '../dto/promo.dto';
import { Promo } from '../entities/promo.entity';

@Injectable()
export class PromoService {
  constructor(
    @InjectRepository(Promo)
    private readonly promoRepository: Repository<Promo>,
  ) {}

  async create(createPromoDTO: PromoDTO): Promise<Promo> {
    const promo = this.promoRepository.create(createPromoDTO);
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
    });
  }

  async findOne(id: string): Promise<Promo> {
    const promo = await this.promoRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!promo) {
      throw new NotFoundException(`Promo with id ${id} not found`);
    }
    return promo;
  }

  async update(id: string, updatePromoDTO: UpdatePromoDTO): Promise<Promo> {
    const promo = await this.findOne(id);
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
