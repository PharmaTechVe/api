import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { Repository } from 'typeorm';
import * as tf from '@tensorflow/tfjs';
import { NearestNeighbors } from './model';
import { PRODUCT_MAPPING, RECOMMENDATION_DATA } from './data';
import { Product } from 'src/products/entities/product.entity';

export type ProductData = {
  name: string;
  totalBought: number;
};

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(ProductPresentation)
    private readonly productPresentationRepository: Repository<ProductPresentation>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProductsId(productNames: string[]): Promise<string[]> {
    const products: { id: string }[] = await this.productRepository
      .createQueryBuilder('product')
      .select('id')
      .where('product.name IN (:...productNames)', { productNames })
      .getRawMany();
    return products.map((product) => product.id);
  }

  async getProductsByUserId(userId: string): Promise<ProductData[]> {
    const products: { name: string; totalBought: number }[] =
      await this.productPresentationRepository
        .createQueryBuilder('productPresentation')
        .select('product.name', 'name')
        .addSelect('COALESCE(SUM(orderDetail.quantity), 0)', 'totalBought')
        .leftJoin('productPresentation.product', 'product')
        .leftJoin('productPresentation.orders', 'orderDetail')
        .leftJoin('orderDetail.order', 'order')
        .andWhere('order.user_id = :userId OR order.user_id IS NULL', {
          userId,
        })
        .andWhere('order.status = :status', { status: 'completed' })
        .groupBy('product.name')
        .orderBy('product.name', 'ASC')
        .getRawMany();
    const completeProductData: ProductData[] = Object.values(
      PRODUCT_MAPPING,
    ).map((productName) => {
      const existingProduct: ProductData | undefined = products.find(
        (p) => p.name === productName,
      );
      return existingProduct ?? { name: productName, totalBought: 0 };
    });
    return completeProductData;
  }

  async recommend(userId: string): Promise<string[]> {
    const productData = await this.getProductsByUserId(userId);
    const recommender = new NearestNeighbors(3);
    recommender.fit(RECOMMENDATION_DATA);
    const productsTensor = tf.tensor(
      productData.map((product) =>
        Number(product.totalBought) ? product.totalBought : 0,
      ),
      [12],
      'float32',
    );
    const recommendations = recommender.kneighbors(productsTensor);
    return this.getProductsId(recommendations);
  }
}
