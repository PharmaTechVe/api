import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderDetail } from './entities/order.entity';
import { BranchService } from 'src/branch/branch.service';
import { ProductPresentationService } from 'src/products/services/product-presentation.service';
import { Branch } from 'src/branch/entities/branch.entity';
import { CityService } from 'src/city/city.service';
import { PromoService } from 'src/discount/services/promo.service';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { City } from 'src/city/entities/city.entity';
import { StateService } from 'src/state/state.service';
import { State } from 'src/state/entities/state.entity';
import { CountryService } from 'src/country/country.service';
import { Country } from 'src/country/entities/country.entity';
import { Promo } from 'src/discount/entities/promo.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderDetail,
      Branch,
      ProductPresentation,
      City,
      State,
      Country,
      Promo,
    ]),
    AuthModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    BranchService,
    ProductPresentationService,
    CityService,
    StateService,
    CountryService,
    PromoService,
  ],
})
export class OrderModule {}
