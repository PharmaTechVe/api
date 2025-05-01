import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ) {}

  async getCartById(id: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.productPresentation',
        'items.productPresentation.product',
        'items.productPresentation.presentation',
        'items.productPresentation.promo',
        'items.productPresentation.product.images',
      ],
    });
    if (!cart) {
      throw new NotFoundException(`Cart with id #${id} not found`);
    }
    return cart;
  }

  async getCartByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'items',
        'items.productPresentation',
        'items.productPresentation.product',
        'items.productPresentation.presentation',
        'items.productPresentation.promo',
        'items.productPresentation.product.images',
      ],
    });
    if (!cart) {
      throw new NotFoundException(`Cart for user #${userId} not found`);
    }
    return cart;
  }

  async createCart(user: User, dto: CreateCartDTO): Promise<Cart> {
    const cartExists = await this.cartRepository.exists({ where: { user } });
    if (cartExists) {
      throw new BadRequestException(`Cart for user #${user.id} already exists`);
    }
    const cart = this.cartRepository.create({ user });
    cart.items = dto.items.map((i) =>
      this.itemRepository.create({
        productPresentation: { id: i.productPresentationId },
        quantity: i.quantity,
      }),
    );
    const saved = await this.cartRepository.save(cart);
    return await this.getCartById(saved.id);
  }

  async listCartItems(user: User): Promise<CartItem[]> {
    const cart = await this.getCartByUserId(user.id);
    return cart?.items ?? [];
  }

  async updateCart(user: User, dto: UpdateCartDTO): Promise<Cart> {
    const cart = await this.getCartByUserId(user.id);
    const incoming = new Map(
      dto.items.map((i) => [i.productPresentationId, i.quantity]),
    );

    for (const item of cart.items) {
      if (!incoming.has(item.productPresentation.id)) {
        await this.itemRepository.delete(item.id);
      } else {
        const qty = incoming.get(item.productPresentation.id)!;
        if (qty <= 0) {
          await this.itemRepository.delete(item.id);
        } else if (qty !== item.quantity) {
          item.quantity = qty;
          await this.itemRepository.save(item);
        }
        incoming.delete(item.productPresentation.id);
      }
    }

    for (const [productId, qty] of incoming.entries()) {
      if (qty > 0) {
        const newItem = this.itemRepository.create({
          cart: { id: cart.id },
          productPresentation: { id: productId },
          quantity: qty,
        });
        await this.itemRepository.save(newItem);
      }
    }

    return await this.getCartById(cart.id);
  }
}
