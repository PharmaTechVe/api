import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { ActivePrincipleService } from './active-principle.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseActivePrincipleDTO } from './dto/active-principle.dto';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';

@Controller('active-principle')
export class ActivePrincipleController {
  constructor(
    private readonly activePrincipleService: ActivePrincipleService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List active principles' })
  @ApiQuery({ name: 'q', required: false, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    description: 'Successful retrieval',
    status: HttpStatus.OK,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponseActivePrincipleDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
    @Query('q') q?: string,
  ): Promise<{ data: ResponseActivePrincipleDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.activePrincipleService.findAll(page, limit, q);
    const total = await this.activePrincipleService.countActivePrinciples(q);
    return { data, total };
  }
}
