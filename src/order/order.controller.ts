import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/order';
import { AuthGuard, CustomRequest } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Creates a new order for the authenticated user.',
  })
  create(@Req() req: CustomRequest, @Body() createOrderDTO: CreateOrderDTO) {
    return this.orderService.create(req.user, createOrderDTO);
  }
}
