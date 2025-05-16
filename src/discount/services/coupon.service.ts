import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import {
  CouponBulkUpdateDTO,
  CouponDTO,
  UpdateCouponDTO,
} from '../dto/coupon.dto';

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
  async findAll(
    page: number,
    pageSize: number,
    q?: string,
    expirationBetween?: Date[],
  ): Promise<Coupon[]> {
    const coupons = this.couponRepository
      .createQueryBuilder('coupon')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('coupon.createdAt', 'DESC');
    if (q) {
      coupons.where('coupon.code ILIKE :code', { code: `%${q}%` });
    }
    if (expirationBetween && expirationBetween.length === 2) {
      coupons.andWhere('coupon.expiration_date BETWEEN :start AND :end', {
        start: expirationBetween[0],
        end: expirationBetween[1],
      });
    }
    return await coupons.getMany();
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

  async bulkDelete(ids: string[]) {
    const coupons = await this.couponRepository.findBy({
      id: In(ids),
      deletedAt: IsNull(),
    });
    if (coupons.length === 0) {
      throw new NotFoundException(`No coupons found with the given IDs`);
    }
    await this.couponRepository.softDelete({ id: In(ids) });
  }

  async bulkUpdate(ids: string[], updateDto: CouponBulkUpdateDTO) {
    const coupons = await this.couponRepository.findBy({
      id: In(ids),
      deletedAt: IsNull(),
    });
    if (coupons.length === 0) {
      throw new NotFoundException(`No coupons found with the given IDs`);
    }
    const couponsToUpdate = coupons.map((coupon) => {
      return { ...coupon, ...updateDto };
    });
    await this.couponRepository.save(couponsToUpdate);
  }
}
