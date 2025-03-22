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
import { CategoryService } from './category.service';
import {
  CategoryDTO,
  CategoryResponseDTO,
  UpdateCategoryDTO,
} from './dto/category.dto';
import { Roles } from 'src/auth/roles.decorador';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category' })
  @ApiResponse({
    description: 'Successful category creation',
    status: HttpStatus.CREATED,
    type: CategoryResponseDTO,
  })
  async create(@Body() categoryDTO: CategoryDTO): Promise<CategoryResponseDTO> {
    return await this.categoryService.create(categoryDTO);
  }

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiResponse({
    description: 'Successful retrieve categories',
    status: HttpStatus.OK,
    type: [CategoryResponseDTO],
  })
  async findAll(): Promise<CategoryResponseDTO[]> {
    return await this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Category by Id' })
  @ApiResponse({
    description: 'Successful find category',
    status: HttpStatus.OK,
    type: CategoryResponseDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CategoryResponseDTO> {
    return await this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Category by Id' })
  @ApiResponse({
    description: 'Successful updated category',
    status: HttpStatus.OK,
    type: CategoryResponseDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() categoryDTO: UpdateCategoryDTO,
  ): Promise<CategoryResponseDTO> {
    return await this.categoryService.update(id, categoryDTO);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Category by Id' })
  @ApiResponse({
    description: 'Successful deleted category',
    status: HttpStatus.NO_CONTENT,
    type: CategoryResponseDTO,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.categoryService.remove(id);
  }
}
