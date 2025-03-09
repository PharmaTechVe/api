import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from 'src/email-template/entities/email-template.entity';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async findByName(name: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { name },
    });
    if (!template) {
      throw new NotFoundException(`Template con nombre ${name} no encontrado`);
    }
    return template;
  }

  async create(name: string, html: string): Promise<EmailTemplate> {
    const template = this.emailTemplateRepository.create({ name, html });
    return this.emailTemplateRepository.save(template);
  }

  async update(id: number, html: string): Promise<EmailTemplate> {
    await this.emailTemplateRepository.update(id, { html });
    const template = await this.emailTemplateRepository.findOne({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`Template con id ${id} no encontrado`);
    }
    return template;
  }

  async delete(id: number): Promise<void> {
    await this.emailTemplateRepository.delete(id);
  }
}
