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
  HttpCode,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryDTO,
  UpdateInventoryDTO,
  ResponseInventoryDTO,
} from './dto/inventory.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserRole } from 'src/user/entities/user.entity';
import { Roles } from 'src/auth/roles.decorador';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Inventory } from './entities/inventory.entity';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an inventory' })
  @ApiResponse({
    description: 'Successful inventory creation',
    status: HttpStatus.CREATED,
    type: ResponseInventoryDTO,
  })
  async create(
    @Body() createInventoryDTO: CreateInventoryDTO,
  ): Promise<ResponseInventoryDTO> {
    return await this.inventoryService.create(createInventoryDTO);
  }

  @Get()
  @ApiOperation({ summary: 'List all inventory' })
  async findAll(): Promise<ResponseInventoryDTO[]> {
    return await this.inventoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an inventory' })
  @ApiResponse({
    description: 'Successful inventory retrieved',
    status: HttpStatus.OK,
    type: ResponseInventoryDTO,
  })
  async findOne(@Param('id') id: string): Promise<ResponseInventoryDTO> {
    return await this.inventoryService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update inventory by ID' })
  @ApiResponse({
    description: 'Successful update of inventory',
    status: HttpStatus.OK,
    type: Inventory,
  })
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDTO: UpdateInventoryDTO,
  ) {
    return await this.inventoryService.update(id, updateInventoryDTO);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete inventory by ID' })
  @ApiResponse({
    description: 'Successful delete of inventory',
    status: HttpStatus.NO_CONTENT,
    type: Inventory,
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.inventoryService.remove(id);
  }
}
