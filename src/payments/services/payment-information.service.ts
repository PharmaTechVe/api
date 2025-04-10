import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentInformation } from '../entities/payment-information.entity';
import { IsNull, Repository } from 'typeorm';
import {
  CreatePaymentInformationDTO,
  UpdatePaymentInformationDTO,
} from '../dto/payment-information.dto';

@Injectable()
export class PaymentInformationService {
  constructor(
    @InjectRepository(PaymentInformation)
    private paymentInfoRepository: Repository<PaymentInformation>,
  ) {}

  async findAll(page: number, pageSize: number): Promise<PaymentInformation[]> {
    return await this.paymentInfoRepository.find({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async create(
    createPaymentInfoDto: CreatePaymentInformationDTO,
  ): Promise<PaymentInformation> {
    const paymentInfo = this.paymentInfoRepository.create(createPaymentInfoDto);
    return this.paymentInfoRepository.save(paymentInfo);
  }

  async findOne(id: string): Promise<PaymentInformation> {
    const paymentInfo = await this.paymentInfoRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!paymentInfo)
      throw new NotFoundException(`Payment information #${id} not found`);
    return paymentInfo;
  }

  async update(
    id: string,
    updatePaymentInfoDto: UpdatePaymentInformationDTO,
  ): Promise<PaymentInformation> {
    const paymentInfo = await this.findOne(id);
    Object.assign(paymentInfo, updatePaymentInfoDto);
    return this.paymentInfoRepository.save(paymentInfo);
  }

  // Eliminación lógica: aquí se puede marcar un campo (por ejemplo, isActive false) en vez de eliminar el registro.
  async remove(id: string): Promise<boolean> {
    const paymentInfo = await this.findOne(id);
    const deleted = await this.paymentInfoRepository.update(paymentInfo.id, {
      deletedAt: new Date(),
    });
    return deleted.affected === 1;
  }
}
