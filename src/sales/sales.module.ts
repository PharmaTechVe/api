import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), AuthModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
