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
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { CouponDTO, UpdateCouponDTO } from '../dto/coupon.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDTO } from 'src/utils/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { getPaginationUrl } from 'src/utils/pagination-urls';
import { Request } from 'express';

@Controller('coupon')
@ApiBearerAuth()
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a coupon' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coupon created successfully',
    type: CouponDTO,
  })
  async create(@Body() createCouponDto: CouponDTO): Promise<CouponDTO> {
    return this.couponService.create(createCouponDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all coupons' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of coupons',
    type: [CouponDTO],
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: Request,
  ): Promise<PaginationDTO<CouponDTO>> {
    const baseUrl = this.configService.get<string>('API_URL') + req.path;
    const count = await this.couponService.countCoupon();
    const coupons = await this.couponService.findAll(page, limit);
    const { next, previous } = getPaginationUrl(baseUrl, page, limit, count);
    return { results: coupons, count, next, previous };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get coupon by code' })
  @ApiResponse({
    description: 'Successful retrieval of coupon',
    status: HttpStatus.OK,
    type: CouponDTO,
  })
  async findOne(@Param('code') code: string): Promise<CouponDTO> {
    return await this.couponService.findOne(code);
  }

  @Patch(':code')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update coupon by code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coupon updated successfully',
    type: CouponDTO,
  })
  async update(
    @Param('code') code: string,
    @Body() updateCouponDto: UpdateCouponDTO,
  ): Promise<CouponDTO> {
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
