import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentInformation } from './entities/payment-information.entity';
import { PaymentConfirmation } from './entities/payment-confirmation.entity';
import { PaymentInformationController } from './controllers/payment-information.controller';
import { PaymentConfirmationController } from './controllers/payment-confirmation.controller';
import { PaymentInformationService } from './services/payment-information.service';
import { PaymentConfirmationService } from './services/payment-confirmation.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentInformation, PaymentConfirmation]),
    AuthModule,
  ],
  controllers: [PaymentInformationController, PaymentConfirmationController],
  providers: [PaymentInformationService, PaymentConfirmationService],
})
export class PaymentModule {}
