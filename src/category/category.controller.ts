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
import { CategoryService } from './category.service';
import {
  CategoryDTO,
  CategoryResponseDTO,
  UpdateCategoryDTO,
} from './dto/category.dto';
import { Roles } from 'src/auth/roles.decorador';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';

@Controller('category')
@ApiExtraModels(PaginationDTO, CategoryResponseDTO)
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
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List all categories' })
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
    name: 'q',
    required: false,
    description: 'Search term for category name',
    type: String,
    example: 'Antibiótico',
  })
  @ApiResponse({
    description: 'Successful retrieve categories',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(CategoryResponseDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
  ): Promise<{ data: CategoryResponseDTO[]; total: number }> {
    const { page, limit, q } = pagination;
    const data = await this.categoryService.findAll(page, limit, q);
    const total = await this.categoryService.countCategories(q);

    return { data, total };
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
