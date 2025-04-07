import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import {
  CouponDTO,
  UpdateCouponDTO,
  ResponseCouponDTO,
} from '../dto/coupon.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiExtraModels,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { PaginationInterceptor } from 'src/utils/pagination.interceptor';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Pagination } from 'src/utils/pagination.decorator';

@Controller('coupon')
@ApiExtraModels(PaginationDTO, ResponseCouponDTO)
@ApiBearerAuth()
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a coupon' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coupon created successfully',
    type: ResponseCouponDTO,
  })
  async create(@Body() createCouponDto: CouponDTO): Promise<ResponseCouponDTO> {
    return this.couponService.create(createCouponDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({ summary: 'List all coupons' })
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
    status: HttpStatus.OK,
    description: 'Successful retrieval of coupons',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDTO) },
        {
          properties: {
            results: {
              type: 'array',
              items: { $ref: getSchemaPath(ResponseCouponDTO) },
            },
          },
        },
      ],
    },
  })
  async findAll(
    @Pagination() pagination: PaginationQueryDTO,
  ): Promise<{ data: ResponseCouponDTO[]; total: number }> {
    const { page, limit } = pagination;
    const data = await this.couponService.findAll(page, limit);
    const total = await this.couponService.countCoupon();
    return { data, total };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get coupon by code' })
  @ApiResponse({
    description: 'Successful retrieval of coupon',
    status: HttpStatus.OK,
    type: ResponseCouponDTO,
  })
  async findOne(@Param('code') code: string): Promise<ResponseCouponDTO> {
    return await this.couponService.findOne(code);
  }

  @Patch(':code')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update coupon by code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coupon updated successfully',
    type: ResponseCouponDTO,
  })
  async update(
    @Param('code') code: string,
    @Body() updateCouponDto: UpdateCouponDTO,
  ): Promise<ResponseCouponDTO> {
    return this.couponService.update(code, updateCouponDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':code')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete coupon by code' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Coupon deleted successfully',
  })
  async remove(@Param('code') code: string): Promise<void> {
    await this.couponService.remove(code);
  }
}
