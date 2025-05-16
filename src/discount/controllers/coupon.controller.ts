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
  Query,
} from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import {
  CouponDTO,
  UpdateCouponDTO,
  ResponseCouponDTO,
  CouponQueryDTO,
  CouponListDeleteDTO,
  CouponListUpdateDTO,
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
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search text to filter by code',
    type: String,
  })
  @ApiQuery({
    name: 'expirationBetween',
    required: false,
    description: 'Filter by expiration date range',
    type: String,
    example: '2023-01-01,2023-12-31',
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
    @Query() pagination: CouponQueryDTO,
  ): Promise<{ data: ResponseCouponDTO[]; total: number }> {
    const { page, limit, q, expirationBetween } = pagination;
    const data = await this.couponService.findAll(
      page,
      limit,
      q,
      expirationBetween,
    );
    const total = await this.couponService.countCoupon();
    return { data, total };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete coupons' })
  @ApiResponse({
    description: 'Successful bulk deletion of coupons',
    status: HttpStatus.NO_CONTENT,
  })
  async bulkDelete(
    @Body() couponListDeleteDTO: CouponListDeleteDTO,
  ): Promise<void> {
    await this.couponService.bulkDelete(couponListDeleteDTO.ids);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update coupons' })
  @ApiResponse({
    description: 'Successful bulk update of coupons',
    status: HttpStatus.NO_CONTENT,
  })
  async bulkUpdate(
    @Body() couponListUpdateDTO: CouponListUpdateDTO,
  ): Promise<void> {
    await this.couponService.bulkUpdate(
      couponListUpdateDTO.ids,
      couponListUpdateDTO.data,
    );
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
