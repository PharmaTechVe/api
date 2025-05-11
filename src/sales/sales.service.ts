import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { Repository } from 'typeorm';
import * as tf from '@tensorflow/tfjs';
import { DailySaleDTO, PredictedSaleDTO } from './dto/predict-sales.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getDailySales(): Promise<DailySaleDTO[]> {
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

  fillMissingDates(data: DailySaleDTO[]): DailySaleDTO[] {
    if (data.length < 2) return data;

    const filled = [];
    const start = new Date(data[0].date);
    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateMap = new Map(
      data.map((d) => [new Date(d.date).toISOString().split('T')[0], d.total]),
    );

    for (let d = new Date(start); d <= yesterday; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      filled.push({
        date: dateStr,
        total: dateMap.get(dateStr) ?? 0,
      });
    }

    return filled;
  }

  async predictNext(daysAhead: number = 7): Promise<PredictedSaleDTO[]> {
    const rawSalesData = await this.getDailySales();
    const salesData = this.fillMissingDates(rawSalesData);

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

    return futureDays.map((_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + index);

      const formatted = date.toISOString().split('T')[0];

      return {
        date: formatted,
        predictedTotal: parseInt(
          (predictedValues as number[][])[index][0].toFixed(2),
        ),
      };
    });
  }
}
