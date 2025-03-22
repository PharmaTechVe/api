import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { Role } from 'src/auth/rol.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreatePresentationDTO,
  UpdatePresentationDTO,
  ResponsePresentationDTO,
} from '../dto/presentation.dto';
import { PresentationService } from '../services/presentation.service';

@Controller('presentation')
export class PresentationController {
  constructor(private readonly presentationService: PresentationService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a presentation' })
  @ApiResponse({
    description: 'Successful presentation creation',
    status: HttpStatus.CREATED,
    type: ResponsePresentationDTO,
  })
  async create(
    @Body() createPresentationDto: CreatePresentationDTO,
  ): Promise<ResponsePresentationDTO> {
    return await this.presentationService.create(createPresentationDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all presentations' })
  @ApiResponse({
    description: 'Successful retrieval of presentations',
    status: HttpStatus.OK,
    type: [ResponsePresentationDTO],
  })
  async findAll(): Promise<ResponsePresentationDTO[]> {
    return await this.presentationService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get presentation by ID' })
  @ApiResponse({
    description: 'Successful retrieval of presentation',
    status: HttpStatus.OK,
    type: ResponsePresentationDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponsePresentationDTO> {
    return await this.presentationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update presentation by ID' })
  @ApiResponse({
    description: 'Successful update of presentation',
    status: HttpStatus.OK,
    type: ResponsePresentationDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePresentationDto: UpdatePresentationDTO,
  ): Promise<ResponsePresentationDTO> {
    return await this.presentationService.update(id, updatePresentationDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete presentation by ID' })
  @ApiResponse({
    description: 'Successful deletion of presentation',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.presentationService.remove(id);
  }
}
