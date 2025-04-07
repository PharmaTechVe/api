import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryDTO, UpdateCategoryDTO } from './dto/category.dto';
import { ILike, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRespository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CategoryDTO): Promise<Category> {
    const categoryData = this.categoryRespository.create(createCategoryDto);
    return await this.categoryRespository.save(categoryData);
  }

  async countCategories(q?: string): Promise<number> {
    const where = q ? { name: ILike(`%${q}%`) } : {};
    return await this.categoryRespository.count({ where });
  }

  async findAll(
    page: number,
    pageSize: number,
    q?: string,
  ): Promise<Category[]> {
    const where = q ? { name: ILike(`%${q}%`) } : {};

    return await this.categoryRespository.find({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRespository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async update(id: string, categoryDto: UpdateCategoryDTO): Promise<Category> {
    const updated = await this.categoryRespository.update(id, categoryDto);
    if (!updated.affected) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.categoryRespository.delete(id);
    if (!deleted.affected) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return true;
  }
}
