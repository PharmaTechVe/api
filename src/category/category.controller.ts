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
  Query,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Request } from 'express';
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
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';

@Controller('category')
@ApiExtraModels(PaginationDTO, CategoryResponseDTO)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private configService: ConfigService,
  ) {}

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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request,
  ): Promise<PaginationDTO<CategoryResponseDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + `${req.path}`;
    const count = await this.categoryService.countCategories();
    const { next, previous } = getPaginationUrl(baseUrl, page, limit, count);
    const categories = await this.categoryService.findAll(page, limit);
    return { results: categories, count, next, previous };
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
