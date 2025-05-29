import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Lot } from '../entities/lot.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LotService {
  constructor(
    @InjectRepository(Lot)
    private lotRepository: Repository<Lot>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    branchId?: string,
    productPresentationId?: string,
  ): Promise<[Lot[], number]> {
    const query = this.lotRepository
      .createQueryBuilder('lot')
      .innerJoinAndSelect('lot.productPresentation', 'productPresentation')
      .innerJoinAndSelect('lot.branch', 'branch')
      .innerJoinAndSelect('branch.city', 'city')
      .innerJoinAndSelect('city.state', 'state')
      .innerJoinAndSelect('state.country', 'country')
      .innerJoinAndSelect('productPresentation.product', 'product')
      .innerJoinAndSelect('productPresentation.presentation', 'presentation')
      .innerJoinAndSelect('product.manufacturer', 'manufacturer');

    if (branchId) {
      query.andWhere('lot.branchId = :branchId', { branchId });
    }

    if (productPresentationId) {
      query.andWhere('lot.productPresentationId = :productPresentationId', {
        productPresentationId,
      });
    }
    query.skip((page - 1) * limit);
    query.take(limit);
    query.orderBy('lot.createdAt', 'DESC');
    const [lots, count] = await query.getManyAndCount();
    return [lots, count];
  }
}
