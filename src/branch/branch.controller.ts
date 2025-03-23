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
  DefaultValuePipe,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { Request } from 'express';
import {
  CreateBranchDTO,
  UpdateBranchDTO,
  ResponseBranchDTO,
} from './dto/branch.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
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

@Controller('branch')
@ApiExtraModels(PaginationDTO, ResponseBranchDTO)
export class BranchController {
  constructor(
    private readonly branchService: BranchService,
    private configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a branch' })
  @ApiResponse({
    description: 'Successful branch creation',
    status: HttpStatus.CREATED,
    type: ResponseBranchDTO,
  })
  async create(
    @Body() createBranchDto: CreateBranchDTO,
  ): Promise<ResponseBranchDTO> {
    return await this.branchService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all branches or filter by city ID' })
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
    description: 'Successful retrieval of branches',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponseBranchDTO) },
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
  ): Promise<PaginationDTO<ResponseBranchDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + `${req.path}`;
    const count = await this.branchService.countBranches();
    const { next, previous } = getPaginationUrl(baseUrl, page, limit, count);
    const branches = await this.branchService.findAll(page, limit);
    return { results: branches, count, next, previous };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiResponse({
    description: 'Successful retrieval of branch',
    status: HttpStatus.OK,
    type: ResponseBranchDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseBranchDTO> {
    return await this.branchService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update branch by ID' })
  @ApiResponse({
    description: 'Successful update of branch',
    status: HttpStatus.OK,
    type: ResponseBranchDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBranchDto: UpdateBranchDTO,
  ): Promise<ResponseBranchDTO> {
    return await this.branchService.update(id, updateBranchDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete branch by ID' })
  @ApiResponse({
    description: 'Successful deletion of branch',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.branchService.remove(id);
  }
}
