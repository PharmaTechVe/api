import { IsEnum, IsString } from 'class-validator';
import { PaymentMethod } from '../entities/payment-information.entity';
import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { BaseDTO } from 'src/utils/dto/base.dto';

export class CreatePaymentInformationDTO {
  @ApiProperty()
  @IsString()
  bank: string;

  @ApiProperty()
  @IsString()
  accountType: 'saving' | 'checking';

  @ApiProperty()
  @IsString()
  account: string;

  @ApiProperty()
  @IsString()
  documentId: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class UpdatePaymentInformationDTO extends PartialType(
  CreatePaymentInformationDTO,
) {}

export class ResponsePaymentInformationDTO extends IntersectionType(
  CreatePaymentInformationDTO,
  BaseDTO,
) {}
