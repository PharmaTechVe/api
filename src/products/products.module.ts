import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductPresentation } from './entities/product-presentation.entity';
import { Manufacturer } from './entities/manufacturer.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Presentation } from './entities/presentation.entity';
import { PresentationService } from './services/presentation.service';
import { PresentationController } from './controllers/presentation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductPresentation,
      Manufacturer,
      Presentation,
    ]),
    AuthModule,
  ],
  controllers: [ProductsController, PresentationController],
  providers: [ProductsService, PresentationService],
})
export class ProductsModule {}
