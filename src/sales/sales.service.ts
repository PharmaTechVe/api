import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { Repository } from 'typeorm';
import * as tf from '@tensorflow/tfjs';
@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getDailySales(): Promise<{ date: string; total: number }[]> {
    const sales = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('SUM(order.totalPrice)', 'total')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .groupBy('DATE(order.createdAt)')
      .orderBy('DATE(order.createdAt)', 'ASC')
      .getRawMany<{ date: string; total: string }>();

    return sales.map((row) => ({
      date: row.date,
      total: parseInt(row.total),
    }));
  }

  async predictNext(daysAhead: number = 7) {
    const salesData = await this.getDailySales();
    if (salesData.length < 2) return [];

    const inputs = salesData.map((_, i) => i);
    const labels = salesData.map((s) => s.total);

    const xs = tf.tensor2d(inputs, [inputs.length, 1]);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [1], units: 1 }));
    model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

    await model.fit(xs, ys, { epochs: 300 });

    const futureDays = Array.from(
      { length: daysAhead },
      (_, i) => inputs.length + i,
    );
    const predictions = model.predict(
      tf.tensor2d(futureDays, [daysAhead, 1]),
    ) as tf.Tensor;

    const predictedValues = await predictions.array();
    return futureDays.map((i, index) => ({
      dayIndex: i,
      predictedTotal: parseInt(
        (predictedValues as number[][])[index][0].toFixed(2),
      ),
    }));
  }
}
