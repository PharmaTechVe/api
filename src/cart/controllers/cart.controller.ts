import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  HttpCode,
  Req,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from '../cart.service';
import {
  CreateCartDTO,
  CartDTO,
  CartItemDTO,
  UpdateCartDTO,
} from '../dto/cart.dto';
import { CustomRequest, AuthGuard } from 'src/auth/auth.guard';
import { plainToInstance } from 'class-transformer';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCart(
    @Req() req: CustomRequest,
    @Body() dto: CreateCartDTO,
  ): Promise<CartDTO> {
    const cart = await this.cartService.createCart(req.user, dto);
    return plainToInstance(CartDTO, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async listCart(@Req() req: CustomRequest): Promise<CartItemDTO[]> {
    const items = await this.cartService.listCartItems(req.user);
    return plainToInstance(CartItemDTO, items, {
      excludeExtraneousValues: true,
    });
  }

  @Patch()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateCart(
    @Req() req: CustomRequest,
    @Body() dto: UpdateCartDTO,
  ): Promise<CartDTO> {
    const cart = await this.cartService.updateCart(req.user, dto);
    return plainToInstance(CartDTO, cart, {
      excludeExtraneousValues: true,
    });
  }
}
