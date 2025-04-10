import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentConfirmation } from '../entities/payment-confirmation.entity';
import { CreatePaymentConfirmationDTO } from '../dto/payment-confirmation.dto';

@Injectable()
export class PaymentConfirmationService {
  constructor(
    @InjectRepository(PaymentConfirmation)
    private paymentConfirmationRepository: Repository<PaymentConfirmation>,
  ) {}

  async create(
    createPaymentConfirmationDto: CreatePaymentConfirmationDTO,
  ): Promise<PaymentConfirmation> {
    const confirmation = this.paymentConfirmationRepository.create(
      createPaymentConfirmationDto,
    );
    return this.paymentConfirmationRepository.save(confirmation);
  }
}
