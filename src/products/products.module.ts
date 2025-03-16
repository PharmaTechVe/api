import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductPresentation } from './entities/product-presentation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductPresentation])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
