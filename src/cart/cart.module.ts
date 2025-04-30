import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartController } from './controllers/cart.controller';
import { CartService } from './cart.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User]), AuthModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
