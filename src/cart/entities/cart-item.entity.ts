import { BaseModel } from 'src/utils/entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class CartItem extends BaseModel {
  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', name: 'quantity' })
  quantity: number;
}
