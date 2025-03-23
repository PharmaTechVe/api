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
import { ManufacturerService } from './services/manufacturer.service';
import { ManufacturerController } from './controllers/manufacturer.controller';
import { CountryService } from 'src/country/country.service';
import { Country } from 'src/country/entities/country.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductPresentation,
      Manufacturer,
      Presentation,
      Country,
      Category,
      ProductImage,
    ]),
    AuthModule,
  ],
  controllers: [
    ProductsController,
    PresentationController,
    ManufacturerController,
  ],
  providers: [
    ProductsService,
    PresentationService,
    ManufacturerService,
    CountryService,
  ],
})
export class ProductsModule {}
