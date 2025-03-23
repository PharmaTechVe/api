import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  CreatePresentationDTO,
  UpdatePresentationDTO,
} from '../dto/presentation.dto';
import { Presentation } from '../entities/presentation.entity';

@Injectable()
export class PresentationService {
  constructor(
    @InjectRepository(Presentation)
    private readonly presentationRepository: Repository<Presentation>,
  ) {}

  async create(
    createPresentationDTO: CreatePresentationDTO,
  ): Promise<Presentation> {
    const presentation = this.presentationRepository.create(
      createPresentationDTO,
    );
    return await this.presentationRepository.save(presentation);
  }

  async countPresentations(): Promise<number> {
    return await this.presentationRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  async findAll(page: number, pageSize: number): Promise<Presentation[]> {
    return await this.presentationRepository.find({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findOne(id: string): Promise<Presentation> {
    const presentation = await this.presentationRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!presentation) {
      throw new NotFoundException(`Presentation #${id} not found`);
    }
    return presentation;
  }

  async update(
    id: string,
    updatePresentationDTO: UpdatePresentationDTO,
  ): Promise<Presentation> {
    const presentation = await this.findOne(id);
    const updatedPresentation = { ...presentation, ...updatePresentationDTO };
    return await this.presentationRepository.save(updatedPresentation);
  }

  async remove(id: string): Promise<boolean> {
    const presentation = await this.findOne(id);
    const deleted = await this.presentationRepository.update(presentation.id, {
      deletedAt: new Date(),
    });
    return deleted.affected === 1;
  }
}
