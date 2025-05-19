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
  Query,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryDTO,
  UpdateInventoryDTO,
  ResponseInventoryDTO,
  InventoryQueryDTO,
  BulkUpdateInventoryDTO,
} from './dto/inventory.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard, CustomRequest } from 'src/auth/auth.guard';
import { UserRole } from 'src/user/entities/user.entity';
import { Roles } from 'src/auth/roles.decorador';
import { BranchId } from 'src/auth/branch-id.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Inventory } from './entities/inventory.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';
import { plainToInstance } from 'class-transformer';

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
    @Req() req: CustomRequest,
    @Body() createInventoryDTO: CreateInventoryDTO,
  ): Promise<ResponseInventoryDTO> {
    if (req.user.role === UserRole.BRANCH_ADMIN) {
      if (!req.user.branch) {
        throw new BadRequestException('Branch not found');
      }
      createInventoryDTO.branchId = req.user.branch.id;
    }
    return await this.inventoryService.create(createInventoryDTO);
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List all inventory' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter by branch ID',
    type: String,
  })
  @ApiQuery({
    name: 'productPresentationId',
    required: false,
    description: 'Filter by product presentation ID',
    type: String,
  })
  @ApiResponse({
    description: 'Successful retrieval of inventories',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponseInventoryDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
    @Query() query: InventoryQueryDTO,
  ): Promise<{ data: ResponseInventoryDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.inventoryService.findAll(
      page,
      limit,
      query.branchId,
      query.productPresentationId,
    );
    const total = await this.inventoryService.countInventories(
      query.branchId,
      query.productPresentationId,
    );
    return {
      data: plainToInstance(ResponseInventoryDTO, data, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      total,
    };
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
    @Req() req: CustomRequest,
    @Param('id') id: string,
    @Body() updateInventoryDTO: UpdateInventoryDTO,
  ) {
    let branchId: string | undefined;
    if (req.user.role === UserRole.BRANCH_ADMIN) {
      branchId = req.user.branch.id;
    }
    return await this.inventoryService.update(id, updateInventoryDTO, branchId);
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
  async remove(
    @Req() req: CustomRequest,
    @Param('id') id: string,
  ): Promise<void> {
    let branchId: string | undefined;
    if (req.user.role === UserRole.BRANCH_ADMIN) {
      branchId = req.user.branch.id;
    }
    await this.inventoryService.remove(id, branchId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BRANCH_ADMIN)
  @Post('bulk')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update inventory for branch admin' })
  @ApiResponse({
    description: 'Bulk update successful',
    status: HttpStatus.OK,
    isArray: true,
    type: ResponseInventoryDTO,
  })
  async bulkUpdateInventory(
    @Body() bulkUpdateDto: BulkUpdateInventoryDTO,
    @BranchId() branchId: string,
  ): Promise<ResponseInventoryDTO[]> {
    return await this.inventoryService.updateBulkByBranch(
      branchId,
      bulkUpdateDto,
    );
  }
}
