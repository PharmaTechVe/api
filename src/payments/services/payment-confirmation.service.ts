import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentConfirmation } from '../entities/payment-confirmation.entity';
import { CreatePaymentConfirmationDTO } from '../dto/payment-confirmation.dto';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class PaymentConfirmationService {
  constructor(
    @InjectRepository(PaymentConfirmation)
    private paymentConfirmationRepository: Repository<PaymentConfirmation>,
    private orderService: OrderService,
  ) {}

  async create(
    userId: string,
    createPaymentConfirmationDto: CreatePaymentConfirmationDTO,
  ): Promise<PaymentConfirmation> {
    const order = await this.orderService.findOne(
      createPaymentConfirmationDto.orderId,
    );

    if (order.user.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to confirm this payment',
      );
    }
    const confirmation = this.paymentConfirmationRepository.create({
      ...createPaymentConfirmationDto,
      order,
    });
    return this.paymentConfirmationRepository.save(confirmation);
  }
}
