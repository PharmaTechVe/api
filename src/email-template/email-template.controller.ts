import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { EmailTemplateService } from 'src/email-template/email-template.service';

@ApiTags('Email Templates')
@Controller('email-templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Template creado exitosamente.' })
  async create(@Body() body: { name: string; html: string }) {
    const template = await this.emailTemplateService.create(
      body.name,
      body.html,
    );
    return template;
  }

  @Get(':name')
  @ApiResponse({ status: 200, description: 'Template obtenido exitosamente.' })
  async findByName(@Param('name') name: string) {
    return this.emailTemplateService.findByName(name);
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'Template actualizado exitosamente.',
  })
  async update(@Param('id') id: number, @Body() body: { html: string }) {
    return this.emailTemplateService.update(id, body.html);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Template eliminado exitosamente.' })
  async delete(@Param('id') id: number) {
    await this.emailTemplateService.delete(id);
  }
}
