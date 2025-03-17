// src/email-template/email-template.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async create(createTemplateDto: {
    name: string;
    html: string;
  }): Promise<EmailTemplate> {
    const template = this.emailTemplateRepository.create(createTemplateDto);
    return await this.emailTemplateRepository.save(template);
  }

  async findAll(): Promise<EmailTemplate[]> {
    return await this.emailTemplateRepository.find();
  }

  async findByName(name: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { name },
    });
    if (!template) {
      throw new NotFoundException('Template no encontrado');
    }
    return template;
  }

  async update(
    id: string,
    updateData: Partial<EmailTemplate>,
  ): Promise<EmailTemplate> {
    await this.emailTemplateRepository.update(id, updateData);
    const updated = await this.emailTemplateRepository.findOne({
      where: { id },
    });
    if (!updated) {
      throw new NotFoundException('Template no encontrado');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.emailTemplateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Template no encontrado');
    }
  }
}
