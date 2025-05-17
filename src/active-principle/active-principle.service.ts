import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ActivePrinciple } from './entities/active-principle.entity';

@Injectable()
export class ActivePrincipleService {
  constructor(
    @InjectRepository(ActivePrinciple)
    private readonly activePrincipleRepository: Repository<ActivePrinciple>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    q?: string,
  ): Promise<ActivePrinciple[]> {
    const where = q ? { name: ILike(`%${q}%`) } : {};
    return await this.activePrincipleRepository.find({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countActivePrinciples(q?: string): Promise<number> {
    const where = q ? { name: ILike(`%${q}%`) } : {};
    return await this.activePrincipleRepository.count({ where });
  }
}
