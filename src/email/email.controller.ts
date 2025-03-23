import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmailService } from './email.service';
import { EmailTemplate } from './entities/email-template.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';

@ApiTags('Email Template')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an email template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: EmailTemplate,
  })
  async create(
    @Body() createTemplateDto: { name: string; html: string },
  ): Promise<EmailTemplate> {
    return await this.emailService.createTemplate(createTemplateDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({
    status: 200,
    description: 'List of templates',
    type: [EmailTemplate],
  })
  async findAll(): Promise<EmailTemplate[]> {
    return await this.emailService.findAllTemplates();
  }

  @Get(':name')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a template by name' })
  @ApiResponse({
    status: 200,
    description: 'Template found',
    type: EmailTemplate,
  })
  @ApiNotFoundResponse({ description: 'Template not found' })
  async findByName(@Param('name') name: string): Promise<EmailTemplate> {
    return await this.emailService.findTemplateByName(name);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
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
    return await this.emailService.updateTemplate(id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an email template' })
  @ApiResponse({ status: 204, description: 'Template removed' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.emailService.removeTemplate(id);
  }
}
