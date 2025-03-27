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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryDTO,
  UpdateInventoryDTO,
  ResponseInventoryDTO,
  InventoryQueryDTO,
} from './dto/inventory.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserRole } from 'src/user/entities/user.entity';
import { Roles } from 'src/auth/roles.decorador';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Inventory } from './entities/inventory.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly configService: ConfigService,
  ) {}

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
    @Query() query: InventoryQueryDTO,
    @Req() req: Request,
  ): Promise<PaginationDTO<ResponseInventoryDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + req.path;
    const [result, count] = await this.inventoryService.findAll(
      query.calculateSkip(),
      query.limit,
      query.branchId,
      query.productPresentationId,
    );
    const { next, previous } = getPaginationUrl(
      baseUrl,
      query.page,
      query.limit,
      count,
    );
    return {
      results: result,
      count,
      next,
      previous,
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
