import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryDTO, UpdateCategoryDTO } from './dto/category.dto';
import { Repository } from 'typeorm';
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

  async countCategories(): Promise<number> {
    return await this.categoryRespository.count();
  }

  async findAll(page: number, pageSize: number): Promise<Category[]> {
    return await this.categoryRespository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
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
