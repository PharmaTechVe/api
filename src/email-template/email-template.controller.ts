import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplate } from './entities/email-template.entity';

@ApiTags('Email Templates')
@Controller('email-templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create an email template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: EmailTemplate,
  })
  async create(
    @Body() createTemplateDto: { name: string; html: string },
  ): Promise<EmailTemplate> {
    return await this.emailTemplateService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({
    status: 200,
    description: 'List of templates',
    type: [EmailTemplate],
  })
  async findAll(): Promise<EmailTemplate[]> {
    return await this.emailTemplateService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get a template by name' })
  @ApiResponse({
    status: 200,
    description: 'Template found',
    type: EmailTemplate,
  })
  @ApiNotFoundResponse({ description: 'Template not found' })
  async findByName(@Param('name') name: string): Promise<EmailTemplate> {
    return await this.emailTemplateService.findByName(name);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an email template' })
  @ApiResponse({
    status: 200,
    description: 'Updated template',
    type: EmailTemplate,
  })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<EmailTemplate>,
  ): Promise<EmailTemplate> {
    return await this.emailTemplateService.update(id, updateData);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an email template' })
  @ApiResponse({ status: 204, description: 'Template removed' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.emailTemplateService.remove(id);
  }
}
