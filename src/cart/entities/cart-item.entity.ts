import { UUIDModel } from 'src/utils/entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Cart } from './cart.entity';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';

@Entity()
export class CartItem extends UUIDModel {
  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(
    () => ProductPresentation,
    (productPresentation) => productPresentation.cartItems,
    { eager: true },
  )
  @JoinColumn({ name: 'product_presentation_id' })
  productPresentation: ProductPresentation;

  @Column({ type: 'int', name: 'quantity' })
  quantity: number;
}
