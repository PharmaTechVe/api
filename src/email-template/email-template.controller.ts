// src/email-template/email-template.controller.ts
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
  @ApiOperation({ summary: 'Crear un template de email' })
  @ApiResponse({
    status: 201,
    description: 'Template creado correctamente',
    type: EmailTemplate,
  })
  async create(
    @Body() createTemplateDto: { name: string; html: string },
  ): Promise<EmailTemplate> {
    return await this.emailTemplateService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los templates de email' })
  @ApiResponse({
    status: 200,
    description: 'Listado de templates',
    type: [EmailTemplate],
  })
  async findAll(): Promise<EmailTemplate[]> {
    return await this.emailTemplateService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Obtener un template por nombre' })
  @ApiResponse({
    status: 200,
    description: 'Template encontrado',
    type: EmailTemplate,
  })
  @ApiNotFoundResponse({ description: 'Template no encontrado' })
  async findByName(@Param('name') name: string): Promise<EmailTemplate> {
    return await this.emailTemplateService.findByName(name);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un template de email' })
  @ApiResponse({
    status: 200,
    description: 'Template actualizado',
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
  @ApiOperation({ summary: 'Eliminar un template de email' })
  @ApiResponse({ status: 204, description: 'Template eliminado' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.emailTemplateService.remove(id);
  }
}
