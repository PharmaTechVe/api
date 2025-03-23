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

  async countBranches(): Promise<number> {
    return await this.branchRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  async findAll(page: number, pageSize: number): Promise<Branch[]> {
    return await this.branchRepository.find({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
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
}
