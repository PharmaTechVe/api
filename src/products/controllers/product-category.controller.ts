import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoryService } from '../services/product-category.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddCategoryDTO, ProductDTO } from '../dto/product.dto';

@Controller('product/:id/category')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product category created successfully',
    type: ProductDTO,
  })
  async create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() categoryDTO: AddCategoryDTO,
  ): Promise<ProductDTO> {
    const categoryId = categoryDTO.categoryId;
    return this.productCategoryService.addCategoryToProduct(id, categoryId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':categoryId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a product category' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product category deleted successfully',
  })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
  ): Promise<void> {
    await this.productCategoryService.removeCategoryFromProduct(id, categoryId);
  }
}
