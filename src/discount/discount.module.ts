import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Promo } from './entities/promo.entity';
import { CouponController } from './controllers/coupon.controller';
import { PromoController } from './controllers/promo.controller';
import { CouponService } from './services/coupon.service';
import { PromoService } from './services/promo.service';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, Promo]),
    ProductsModule,
    AuthModule,
  ],
  controllers: [CouponController, PromoController],
  providers: [CouponService, PromoService],
  exports: [CouponService, PromoService],
})
export class DiscountModule {}
