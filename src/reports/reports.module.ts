import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [OrderModule, UserModule, AuthModule],
  controllers: [ReportsController],
})
export class ReportsModule {}
