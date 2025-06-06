import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { LoggerModule } from 'nestjs-pino';
import { CategoryModule } from './category/category.module';
import { CountryModule } from './country/country.module';
import { StateModule } from './state/state.module';
import { CityModule } from './city/city.module';
import { BranchModule } from './branch/branch.module';
import { InventoryModule } from './inventory/inventory.module';
import { DiscountModule } from './discount/discount.module';
import { PaymentModule } from './payments/payment.module';
import { OrderModule } from './order/order.module';
import { NotificationModule } from './notification/notification.module';
import { CartModule } from './cart/cart.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { ReportsModule } from './reports/reports.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SalesModule } from './sales/sales.module';
import { ActivePrincipleModule } from './active-principle/active-principle.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          pinoHttp: {
            level: configService.get('LOG_LEVEL'),
            transport:
              configService.get<boolean>('DEBUG') !== false
                ? {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      levelFirst: true,
                      translateTime: 'SYS:standard',
                    },
                  }
                : undefined,
          },
        };
      },
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    ProductsModule,
    UserModule,
    AuthModule,
    EmailModule,
    CategoryModule,
    CountryModule,
    StateModule,
    CityModule,
    BranchModule,
    InventoryModule,
    DiscountModule,
    PaymentModule,
    OrderModule,
    NotificationModule,
    CartModule,
    RecommendationModule,
    ReportsModule,
    SalesModule,
    ActivePrincipleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
