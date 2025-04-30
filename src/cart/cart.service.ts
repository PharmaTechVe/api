import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateCartDTO, UpdateCartDTO } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private itemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createCart(userPayload: User, dto: CreateCartDTO): Promise<Cart> {
    const user = await this.userRepository.findOneBy({ id: userPayload.id });
    if (!user) {
      throw new NotFoundException(`User #${userPayload.id} not found`);
    }

    const cart = this.cartRepository.create({ user });
    cart.items = dto.items.map((i) =>
      this.itemRepository.create({
        product: { id: i.productId } as { id: string },
        quantity: i.quantity,
      }),
    );
    const saved = await this.cartRepository.save(cart);

    return this.cartRepository.findOneOrFail({
      where: { id: saved.id },
      relations: [
        'user',
        'items',
        'items.product',
        'items.product.product', // for obtaining the name product
      ],
    });
  }

  async listCartItems(userPayload: User): Promise<CartItem[]> {
    const user = await this.userRepository.findOneBy({ id: userPayload.id });
    if (!user) {
      throw new NotFoundException(`User #${userPayload.id} not found`);
    }

    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.product', 'items.product.product'],
    });

    return cart?.items ?? [];
  }

  async updateCart(userPayload: User, dto: UpdateCartDTO): Promise<Cart> {
    const user = await this.userRepository.findOneBy({ id: userPayload.id });
    if (!user) {
      throw new NotFoundException(`User #${userPayload.id} not found`);
    }

    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['items'],
    });
    if (!cart)
      throw new NotFoundException(`Cart for user #${user.id} not found`);

    const incoming = new Map(dto.items.map((i) => [i.productId, i.quantity]));

    for (const item of cart.items) {
      if (!incoming.has(item.product.id)) {
        await this.itemRepository.delete(item.id);
      } else {
        const qty = incoming.get(item.product.id)!;
        if (qty <= 0) {
          await this.itemRepository.delete(item.id);
        } else if (qty !== item.quantity) {
          item.quantity = qty;
          await this.itemRepository.save(item);
        }
        incoming.delete(item.product.id);
      }
    }

    for (const [productId, qty] of incoming.entries()) {
      if (qty > 0) {
        const newItem = this.itemRepository.create({
          cart: { id: cart.id } as Cart,
          product: { id: productId } as { id: string },
          quantity: qty,
        });
        await this.itemRepository.save(newItem);
      }
    }

    return this.cartRepository.findOneOrFail({
      where: { id: cart.id },
      relations: ['user', 'items', 'items.product', 'items.product.product'],
    });
  }
}
