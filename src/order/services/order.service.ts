import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDTO, SalesReportDTO } from '../dto/order';
import { User } from 'src/user/entities/user.entity';
import { ProductPresentationService } from 'src/products/services/product-presentation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Order,
  OrderDetail,
  OrderStatus,
  OrderType,
} from '../entities/order.entity';
import { BranchService } from 'src/branch/branch.service';
import { Branch } from 'src/branch/entities/branch.entity';
import {
  OrderDelivery,
  OrderDeliveryStatus,
} from '../entities/order_delivery.entity';
import { UserAddress } from 'src/user/entities/user-address.entity';
import { UserService } from 'src/user/user.service';
import { CouponService } from 'src/discount/services/coupon.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { InventoryMovementService } from 'src/inventory/services/inventory-movement.service';
import { MovementType } from 'src/inventory/entities/inventory-movement.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/email/email.service';
import Handlebars from 'handlebars';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(OrderDelivery)
    private orderDeliveryRepository: Repository<OrderDelivery>,
    private productPresentationService: ProductPresentationService,
    private branchService: BranchService,
    private userService: UserService,
    private inventoryService: InventoryService,
    private couponService: CouponService,
    private inventoryMovementService: InventoryMovementService,
    private eventEmitter: EventEmitter2,
    private emailService: EmailService,
  ) {}

  async create(user: User, createOrderDTO: CreateOrderDTO) {
    let branch: Branch;
    let userAddress: UserAddress | undefined = undefined;
    if (createOrderDTO.type == OrderType.PICKUP) {
      if (!createOrderDTO.branchId) {
        throw new BadRequestException(
          'Branch ID is required for pickup orders',
        );
      }
      branch = await this.branchService.findOne(createOrderDTO.branchId);
    } else if (createOrderDTO.type == OrderType.DELIVERY) {
      if (!createOrderDTO.userAddressId) {
        throw new BadRequestException(
          'User address ID is required for delivery orders',
        );
      }
      userAddress = await this.userService.getAddress(
        user.id,
        createOrderDTO.userAddressId,
      );
      const nearestBranch = await this.branchService.findNearestBranch(
        userAddress.latitude,
        userAddress.longitude,
      );
      branch = nearestBranch;
    } else {
      throw new BadRequestException('Invalid order type');
    }
    const products = await this.productPresentationService.findByIds(
      createOrderDTO.products.map((product) => product.productPresentationId),
    );
    const productsById = createOrderDTO.products.reduce(
      (acc: { [key: string]: number }, product) => {
        acc[product.productPresentationId] = product.quantity;
        return acc;
      },
      {},
    );
    const productsWithQuantity = products.map((product) => ({
      ...product,
      quantity: productsById[product.id],
    }));
    const presentationIds = productsWithQuantity.map((p) => p.id);
    const inventories =
      await this.inventoryService.getBulkTotalInventory(presentationIds);
    for (const item of productsWithQuantity) {
      const available = inventories[item.id] ?? 0;
      if (item.quantity > available) {
        throw new BadRequestException(
          `Insufficient inventory for productPresentation ${item.id}`,
        );
      }
    }

    let totalPrice = productsWithQuantity.reduce((acc, product) => {
      const price = product.promo
        ? product.price - (product.price * product.promo.discount) / 100
        : product.price;
      return acc + Math.round(price) * product.quantity;
    }, 0);

    if (productsWithQuantity.length == 0) {
      throw new BadRequestException('No products found');
    }
    if (createOrderDTO.couponCode) {
      totalPrice = await this.validateAndApplyCoupon(
        createOrderDTO.couponCode,
        totalPrice,
      );
    }
    const orderToCreate = this.orderRepository.create({
      user,
      branch,
      type: createOrderDTO.type,
      totalPrice: totalPrice,
      paymentMethod: createOrderDTO.paymentMethod,
    });
    const order = await this.orderRepository.save(orderToCreate);
    const orderDetails = productsWithQuantity.map((product) => {
      return this.orderDetailRepository.create({
        order,
        productPresentation: product,
        quantity: product.quantity,
        price: product.price,
        subtotal: product.price * product.quantity,
      });
    });
    await this.orderDetailRepository.save(orderDetails);
    if (createOrderDTO.type == OrderType.DELIVERY && userAddress) {
      const delivery = this.orderDeliveryRepository.create({
        order,
        branch,
        address: userAddress,
        estimatedTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        deliveryStatus: OrderDeliveryStatus.TO_ASSIGN,
      });
      await this.orderDeliveryRepository.save(delivery);
    }
    return order;
  }

  private async validateAndApplyCoupon(
    couponCode: string,
    totalPrice: number,
  ): Promise<number> {
    const coupon = await this.couponService.findOne(couponCode);

    if (coupon.expirationDate.getTime() < Date.now()) {
      throw new BadRequestException('Coupon expired');
    }
    if (totalPrice < coupon.minPurchase) {
      throw new BadRequestException(
        `Minimum purchase of ${coupon.minPurchase} required to use this coupon`,
      );
    }
    if (coupon.maxUses <= 0) {
      throw new BadRequestException('Coupon has no remaining uses');
    }
    const discountAmount = Math.round((totalPrice * coupon.discount) / 100);
    const newTotal = totalPrice - discountAmount;
    await this.couponService.update(coupon.code, {
      maxUses: coupon.maxUses - 1,
    });
    return newTotal;
  }

  async findAll(
    page: number,
    pageSize: number,
    userId?: string,
    branchId?: string,
    status?: string,
    type?: string,
  ) {
    const where: Record<string, unknown> = {};
    if (userId) where.user = { id: userId };
    if (branchId) where.branch = { id: branchId };
    if (status) where.status = status;
    if (type) where.type = type;
    const [orders, total] = await this.orderRepository.findAndCount({
      where: where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { orders, total };
  }

  async findOne(id: string, userId?: string, branchId?: string) {
    const where: Record<string, unknown> = { id };
    if (userId) where.user = { id: userId };
    if (branchId) where.branch = { id: branchId };
    const order = await this.orderRepository.findOne({
      where: where,
      relations: [
        'branch',
        'details',
        'details.productPresentation',
        'details.productPresentation.promo',
        'details.productPresentation.product',
        'details.productPresentation.product.images',
        'details.productPresentation.presentation',
        'orderDeliveries.employee',
        'paymentConfirmation',
      ],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findOneWithUser(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'branch',
        'details',
        'details.productPresentation',
        'details.productPresentation.promo',
        'details.productPresentation.product',
        'details.productPresentation.product.images',
        'details.productPresentation.presentation',
        'orderDeliveries.employee',
        'paymentConfirmation',
        'user',
        'user.profile',
      ],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async update(
    id: string,
    status: OrderStatus,
    branchId?: string,
  ): Promise<Order> {
    const order = await this.findOne(id, undefined, branchId);
    if (order.status === OrderStatus.COMPLETED) {
      console.log('A COMPLETED order cannot be modified');
      return order;
    }
    if (
      status === OrderStatus.APPROVED &&
      order.status === OrderStatus.REQUESTED
    ) {
      for (const detail of order.details) {
        const inv = await this.inventoryService.findByPresentationAndBranch(
          detail.productPresentation.id,
          order.branch.id,
        );
        await this.inventoryService.decrementInventory(
          detail.productPresentation.id,
          order.branch.id,
          detail.quantity,
        );
        await this.inventoryMovementService.createMovement(
          inv,
          detail.quantity,
          MovementType.OUT,
        );
      }
    }

    order.status = status;
    const orderWithUser = await this.findOneWithUser(order.id);
    this.eventEmitter.emit('order.updated', orderWithUser);
    return await this.orderRepository.save(order);
  }

  async bulkUpdate(
    ordersIds: string[],
    status: OrderStatus,
    branchId?: string,
  ) {
    let where: Record<string, unknown> = { id: In(ordersIds) };
    if (branchId) {
      where = {
        ...where,
        branch: { id: branchId },
      };
    }
    const orders = await this.orderRepository.findBy(where);
    if (orders.length === 0) {
      throw new NotFoundException('No orders found');
    }
    const updatedOrders = orders.map((order) => {
      if (order.status !== OrderStatus.COMPLETED) {
        order.status = status;
        return order;
      } else return order;
    });
    return await this.orderRepository.save(updatedOrders);
  }

  async countOrdersCompleted(
    status: OrderStatus,
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<number> {
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .where(`DATE(order.created_at) BETWEEN :start AND :end`, {
        start: startStr,
        end: endStr,
      })
      .andWhere('order.status = :status', { status })
      .leftJoin('order.branch', 'branch');
    if (branchId) {
      qb.andWhere('branch.id = :branchId', { branchId });
    }
    return qb.getCount();
  }

  async countOpenOrders(
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<number> {
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .where(`DATE(order.created_at) BETWEEN :start AND :end`, {
        start: startStr,
        end: endStr,
      })
      .andWhere('order.status NOT IN (:...closed)', {
        closed: [OrderStatus.COMPLETED, OrderStatus.CANCELED],
      })
      .leftJoin('order.branch', 'branch');

    if (branchId) {
      qb.andWhere('branch.id = :branchId', { branchId });
    }
    return qb.getCount();
  }

  async sumTotalSales(
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<number> {
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_price)', 'sum')
      .where(`DATE(order.created_at) BETWEEN :start AND :end`, {
        start: startStr,
        end: endStr,
      })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .leftJoin('order.branch', 'branch');

    if (branchId) {
      qb.andWhere('branch.id = :branchId', { branchId });
    }
    const raw = await qb.getRawOne<{ sum: string }>();
    return Number(raw?.sum ?? '0');
  }

  async countOrdersByStatus(
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<Record<OrderStatus, number>> {
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where(`DATE(order.created_at) BETWEEN :start AND :end`, {
        start: startStr,
        end: endStr,
      })
      .leftJoin('order.branch', 'branch');
    if (branchId) {
      qb.andWhere('branch.id = :branchId', { branchId });
    }
    qb.groupBy('order.status');
    const rows = await qb.getRawMany<{ status: OrderStatus; count: string }>();
    return rows.reduce(
      (acc, { status, count }) => {
        acc[status] = Number(count);
        return acc;
      },
      {} as Record<OrderStatus, number>,
    );
  }

  async getUserByOrderId(orderId: string): Promise<User> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order.user;
  }

  async getSalesReport(
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<SalesReportDTO[]> {
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);
    const qb = this.orderRepository
      .createQueryBuilder('o')
      .select('o.id', 'orderId')
      .addSelect(`CONCAT(u.firstName, ' ', u.lastName)`, 'user')
      .addSelect('o.createdAt', 'date')
      .addSelect('o.type', 'type')
      .addSelect('SUM(d.quantity)', 'quantity')
      .addSelect('SUM(d.subtotal)', 'subtotal')
      .addSelect('SUM(d.quantity * d.price) - o.totalPrice', 'discount')
      .addSelect('o.totalPrice', 'total')
      .innerJoin('o.user', 'u')
      .innerJoin('o.details', 'd')
      .innerJoin('d.productPresentation', 'pp')
      .where(`DATE(o.created_at) BETWEEN :start AND :end`, {
        start: startStr,
        end: endStr,
      })
      .andWhere('o.status = :status', { status: OrderStatus.COMPLETED });

    if (branchId) {
      qb.andWhere('o.branch_id = :branchId', { branchId });
    }
    qb.groupBy('o.id')
      .addGroupBy('u.firstName')
      .addGroupBy('u.lastName')
      .addGroupBy('o.createdAt')
      .addGroupBy('o.type')
      .addGroupBy('o.totalPrice');

    const raws = await qb.getRawMany<{
      orderId: string;
      user: string;
      date: string;
      type: string;
      quantity: string;
      subtotal: string;
      discount: string;
      total: string;
    }>();

    return raws.map((r) => ({
      orderId: r.orderId,
      user: r.user,
      date: new Date(r.date),
      type: r.type.toUpperCase(),
      quantity: Number(r.quantity),
      subtotal: Number(r.subtotal),
      discount: Number(r.discount),
      total: Number(r.total),
    }));
  }

  @OnEvent('order.updated')
  async handleOrderUpdated(order: Order) {
    let templateName = '';
    switch (order.status) {
      case OrderStatus.APPROVED:
        templateName = 'order-approved';
        break;
      case OrderStatus.COMPLETED:
        templateName = 'order-completed';
        break;
      default:
        return;
    }
    let subject = '';
    switch (order.status) {
      case OrderStatus.APPROVED:
        subject = 'Orden Aprobada';
        break;
      case OrderStatus.COMPLETED:
        subject = 'Orden Completada';
        break;
      default:
        return;
    }
    const template = await this.emailService.findTemplateByName(templateName);
    const handlebarsTemplate = Handlebars.compile(template.html);
    const userAddress =
      order.type === OrderType.DELIVERY
        ? order.orderDeliveries[0].address
        : null;
    const html = handlebarsTemplate({
      id: order.id.slice(0, 8),
      subtotal:
        order.details.reduce((acc, detail) => acc + detail.subtotal, 0) / 100,
      discount:
        order.details.reduce(
          (acc, detail) =>
            acc +
            (detail.productPresentation.promo
              ? (detail.productPresentation.price *
                  detail.productPresentation.promo.discount) /
                100
              : 0),
          0,
        ) / 100,
      total: order.totalPrice / 100,
      products: order.details.map((detail) => ({
        name: detail.productPresentation.product.name,
        presentation: detail.productPresentation.presentation.name,
        price: detail.productPresentation.price / 100,
        quantity: detail.quantity,
      })),
      userAddress: userAddress ? userAddress.adress : null,
      userCity: userAddress ? userAddress.city.name : null,
      userState: userAddress ? userAddress.city.state.name : null,
      branchAddress: order.branch.address,
      branchCity: order.branch.city.name,
      // TODO: fix this
      branchState: 'Lara', //order.branch.city.state.name,
    });
    await this.emailService.sendEmail({
      recipients: [{ name: order.user.firstName, email: order.user.email }],
      subject: subject,
      text: `Your order with ID ${order.id} has been updated to status ${order.status}.`,
      html: html,
    });
  }
}
