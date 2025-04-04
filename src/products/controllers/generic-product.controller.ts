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
  UseInterceptors,
} from '@nestjs/common';
import { GenericProductService } from '../services/generic-product.service';
import {
  CreateGenericProductDTO,
  UpdateGenericProductDTO,
  ResponseGenericProductDTO,
} from '../dto/generic-product.dto';
import { Product } from '../entities/product.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  PaginationDTO,
  PaginationQueryDTO,
} from 'src/utils/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { Pagination } from 'src/utils/pagination.decorator';

@ApiTags('Generic Product')
@Controller('product/generic')
export class GenericProductController {
  constructor(private readonly genericProductService: GenericProductService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a generic product' })
  @ApiResponse({
    description: 'Successful creation of a generic product',
    status: HttpStatus.CREATED,
    type: ResponseGenericProductDTO,
  })
  async create(
    @Body() createProductDto: CreateGenericProductDTO,
  ): Promise<ResponseGenericProductDTO> {
    return await this.genericProductService.create(createProductDto);
  }

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List all generic products with pagination' })
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
    description: 'Successful retrieval of generic products',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponseGenericProductDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
  ): Promise<{ data: ResponseGenericProductDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.genericProductService.findAll(page, limit);
    const total = await this.genericProductService.countProducts();
    return { data, total };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a generic product by ID' })
  @ApiResponse({
    description: 'Successful retrieval of a generic product',
    status: HttpStatus.OK,
    type: ResponseGenericProductDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseGenericProductDTO> {
    return await this.genericProductService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a generic product by ID' })
  @ApiResponse({
    description: 'Successful update of a generic product',
    status: HttpStatus.OK,
    type: ResponseGenericProductDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProductDTO: UpdateGenericProductDTO,
  ): Promise<Product> {
    return await this.genericProductService.update(id, updateProductDTO);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a generic product by ID' })
  @ApiResponse({
    description: 'Successful soft deletion of a generic product',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.genericProductService.remove(id);
  }
}
