import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPresentation, Product])],
  controllers: [],
  providers: [RecommendationService],
})
export class RecommendationModule {}
