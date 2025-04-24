import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CouponDTO, UpdateCouponDTO } from '../dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CouponDTO): Promise<Coupon> {
    const coupon = this.couponRepository.create(createCouponDto);
    return await this.couponRepository.save(coupon);
  }

  async countCoupon(): Promise<number> {
    return await this.couponRepository.count();
  }
  async findAll(page: number, pageSize: number): Promise<Coupon[]> {
    return await this.couponRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }
    return coupon;
  }

  async update(
    code: string,
    updateCouponDto: UpdateCouponDTO,
  ): Promise<Coupon> {
    const updated = await this.couponRepository.update(
      { code },
      updateCouponDto,
    );
    if (!updated.affected) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }

    const newCode = updateCouponDto.code ? updateCouponDto.code : code;
    return await this.findOne(newCode);
  }

  async remove(code: string): Promise<boolean> {
    const coupon = await this.findOne(code);
    const deleted = await this.couponRepository.delete({ id: coupon.id });
    if (!deleted.affected) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }
    return true;
  }
}
