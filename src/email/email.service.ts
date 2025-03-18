import { Injectable, NotFoundException } from '@nestjs/common';
import { ResendHelper } from './resend/resend.helper';
import { EmailOptions, EmailOptionsContent } from './email.helper';
import { EmailTemplate } from 'src/email/entities/email-template.entity';
import { EntityManager,  } from 'typeorm';

@Injectable()
export class EmailService {
  constructor(
    private readonly resend: ResendHelper,
    private readonly manager: EntityManager,
  ) {}

  async sendEmail(options: EmailOptions & EmailOptionsContent): Promise<boolean> {
    return this.resend.sendEmail(options);
  }

  async createTemplate(createTemplateDto: { name: string; html: string }): Promise<EmailTemplate> {
    const template = this.manager.create(EmailTemplate, createTemplateDto);
    return await this.manager.save(template);
  }

  async findAllTemplates(): Promise<EmailTemplate[]> {
    return await this.manager.find(EmailTemplate);
  }

  async findTemplateByName(name: string): Promise<EmailTemplate> {
    const template = await this.manager.findOne(EmailTemplate, { where: { name } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async updateTemplate(id: string, updateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const template = await this.manager.findOne(EmailTemplate, { where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    Object.assign(template, updateData);
    return this.manager.save(template);
  }

  async removeTemplate(id: string): Promise<void> {
    const template = await this.manager.findOne(EmailTemplate, { where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    await this.manager.remove(template);
  }
}
