import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateBranchDTO, UpdateBranchDTO } from './dto/branch.dto';
import { Branch } from './entities/branch.entity';
import { CityService } from 'src/city/city.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private cityService: CityService,
  ) {}

  async create(createBranchDTO: CreateBranchDTO): Promise<Branch> {
    const branch = this.branchRepository.create(createBranchDTO);
    branch.city = await this.cityService.findOne(createBranchDTO.cityId);
    return await this.branchRepository.save(branch);
  }

  async countBranches(q?: string, stateId?: string): Promise<number> {
    const qb = this.branchRepository
      .createQueryBuilder('branch')
      .leftJoin('branch.city', 'city')
      .leftJoin('city.state', 'state')
      .where('branch.deletedAt IS NULL');

    if (q) {
      qb.andWhere('branch.name ILIKE :q', { q: `%${q}%` });
    }

    if (stateId) {
      qb.andWhere('state.id = :stateId', { stateId });
    }

    return qb.getCount();
  }

  async findAll(
    page: number,
    limit: number,
    q?: string,
    stateId?: string,
  ): Promise<Branch[]> {
    const qb = this.branchRepository
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.city', 'city')
      .leftJoinAndSelect('city.state', 'state')
      .leftJoinAndSelect('state.country', 'country')
      .where('branch.deletedAt IS NULL');

    if (q) {
      qb.andWhere('branch.name ILIKE :q', { q: `%${q}%` });
    }

    if (stateId) {
      qb.andWhere('state.id = :stateId', { stateId });
    }

    return qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('branch.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!branch) {
      throw new NotFoundException(`Branch #${id} not found`);
    }
    return branch;
  }

  async update(id: string, updateBranchDTO: UpdateBranchDTO): Promise<Branch> {
    const branch = await this.findOne(id);
    const updatedBranch = { ...branch, ...updateBranchDTO };
    if (updateBranchDTO.cityId) {
      updatedBranch.city = await this.cityService.findOne(
        updateBranchDTO.cityId,
      );
    }
    return await this.branchRepository.save(updatedBranch);
  }

  async remove(id: string): Promise<boolean> {
    const branch = await this.findOne(id);
    const deleted = await this.branchRepository.update(branch.id, {
      deletedAt: new Date(),
    });
    return deleted.affected === 1;
  }

  async findNearestBranch(lat: number, lng: number): Promise<Branch> {
    const branch = await this.branchRepository
      .createQueryBuilder('branch')
      .orderBy(
        `ST_DistanceSphere(ST_MakePoint(branch.longitude, branch.latitude), ST_MakePoint(:lng, :lat))`,
      )
      .setParameters({ lat, lng })
      .getOne();

    if (!branch) {
      throw new NotFoundException('No closer branch found');
    }

    return branch;
  }
}
