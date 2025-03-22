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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateManufacturerDTO,
  UpdateManufacturerDTO,
  ResponseManufacturerDTO,
} from '../dto/manufacturer.dto';
import { ManufacturerService } from '../services/manufacturer.service';
import { UserRole } from 'src/user/entities/user.entity';
@Controller('manufacturer')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a manufacturer' })
  @ApiResponse({
    description: 'Successful manufacturer creation',
    status: HttpStatus.CREATED,
    type: ResponseManufacturerDTO,
  })
  async create(
    @Body() createManufacturerDto: CreateManufacturerDTO,
  ): Promise<ResponseManufacturerDTO> {
    return await this.manufacturerService.create(createManufacturerDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all manufacturers' })
  @ApiResponse({
    description: 'Successful retrieval of manufacturers',
    status: HttpStatus.OK,
    type: [ResponseManufacturerDTO],
  })
  async findAll(): Promise<ResponseManufacturerDTO[]> {
    return await this.manufacturerService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get manufacturer by ID' })
  @ApiResponse({
    description: 'Successful retrieval of manufacturer',
    status: HttpStatus.OK,
    type: ResponseManufacturerDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseManufacturerDTO> {
    return await this.manufacturerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update manufacturer by ID' })
  @ApiResponse({
    description: 'Successful update of manufacturer',
    status: HttpStatus.OK,
    type: ResponseManufacturerDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateManufacturerDto: UpdateManufacturerDTO,
  ): Promise<ResponseManufacturerDTO> {
    return await this.manufacturerService.update(id, updateManufacturerDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete manufacturer by ID' })
  @ApiResponse({
    description: 'Successful deletion of manufacturer',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.manufacturerService.remove(id);
  }
}
