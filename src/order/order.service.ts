import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDTO } from './dto/order';
import { User, UserRole } from 'src/user/entities/user.entity';
import { ProductPresentationService } from 'src/products/services/product-presentation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Order,
  OrderDetail,
  OrderStatus,
  OrderType,
} from './entities/order.entity';
import { BranchService } from 'src/branch/branch.service';
import { Branch } from 'src/branch/entities/branch.entity';
import {
  OrderDelivery,
  OrderDeliveryStatus,
} from './entities/order_delivery.entity';
import { UpdateDeliveryDTO } from './dto/order-delivery.dto';
import { UserAddress } from 'src/user/entities/user-address.entity';
import { UserService } from 'src/user/user.service';
import { CouponService } from 'src/discount/services/coupon.service';
import { InventoryService } from 'src/inventory/inventory.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,
    private productPresentationService: ProductPresentationService,
    private branchService: BranchService,
    @InjectRepository(OrderDelivery)
    private orderDeliveryRepository: Repository<OrderDelivery>,
    private userService: UserService,
    private readonly inventoryService: InventoryService,
    private couponService: CouponService,
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
      // TODO: Find the closest branch to the address
      const branches = await this.branchService.findAll(1, 10);
      branch = branches[0];
      userAddress = await this.userService.getAddress(
        user.id,
        createOrderDTO.userAddressId,
      );
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
    });
    const order = await this.orderRepository.save(orderToCreate);
    const orderDetails = productsWithQuantity.map((product) => {
      return this.orderDetailRepository.create({
        order,
        productPresentation: product,
        quantity: product.quantity,
        subtotal: product.promo
          ? Math.round(
              product.price - (product.price * product.promo.discount) / 100,
            ) * product.quantity
          : product.price * product.quantity,
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
  ) {
    const where: Record<string, unknown> = {};
    if (userId) where.user = { id: userId };
    if (branchId) where.branch = { id: branchId };
    if (status) where.status = status;
    const [orders, total] = await this.orderRepository.findAndCount({
      where: where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { orders, total };
  }

  async findOne(id: string, userId?: string) {
    const where: Record<string, unknown> = { id };
    if (userId) where.user = { id: userId };
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
      ],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
  async update(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('A COMPLETED order cannot be modified');
    }
    if (status === OrderStatus.APPROVED) {
      for (const detail of order.details) {
        await this.inventoryService.decrementInventory(
          detail.productPresentation.id,
          order.branch.id,
          detail.quantity,
        );
      }
    }

    order.status = status;
    return await this.orderRepository.save(order);
  }

  async findAllOD(
    user: User,
    page: number,
    pageSize: number,
    filters?: {
      status?: string;
      branchId?: string;
      employeeId?: string;
    },
  ): Promise<OrderDelivery[]> {
    const query = this.orderDeliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.user', 'orderUser')
      .leftJoinAndSelect('orderUser.profile', 'profile')
      .leftJoinAndSelect('delivery.address', 'address')
      .leftJoinAndSelect('address.city', 'city')
      .leftJoinAndSelect('city.state', 'state')
      .leftJoinAndSelect('state.country', 'country')
      .leftJoinAndSelect('delivery.branch', 'branch')
      .leftJoinAndSelect('delivery.employee', 'employee')
      .where('delivery.deletedAt IS NULL');

    if (user.role !== UserRole.ADMIN) {
      query.andWhere('employee.id = :userId', { userId: user.id });
    } else if (filters?.employeeId) {
      query.andWhere('employee.id = :employeeId', {
        employeeId: filters.employeeId,
      });
    }

    if (filters?.status) {
      query.andWhere('delivery.deliveryStatus = :status', {
        status: filters.status,
      });
    }

    if (filters?.branchId) {
      query.andWhere('branch.id = :branchId', { branchId: filters.branchId });
    }

    const delivery = query
      .orderBy('delivery.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    return await delivery.getMany();
  }

  async countDeliveries(
    user: User,
    filters?: {
      status?: string;
      branchId?: string;
      employeeId?: string;
    },
  ): Promise<number> {
    const query = this.orderDeliveryRepository
      .createQueryBuilder('delivery')
      .leftJoin('delivery.branch', 'branch')
      .leftJoin('delivery.employee', 'employee')
      .where('delivery.deletedAt IS NULL');

    if (user.role !== UserRole.ADMIN) {
      query.andWhere('employee.id = :userId', { userId: user.id });
    } else if (filters?.employeeId) {
      query.andWhere('employee.id = :employeeId', {
        employeeId: filters.employeeId,
      });
    }

    if (filters?.status) {
      query.andWhere('delivery.deliveryStatus = :status', {
        status: filters.status,
      });
    }

    if (filters?.branchId) {
      query.andWhere('branch.id = :branchId', { branchId: filters.branchId });
    }

    return await query.getCount();
  }

  async getDelivery(deliveryId: string): Promise<OrderDelivery> {
    const delivery = await this.orderDeliveryRepository.findOne({
      where: { id: deliveryId },
      relations: [
        'order',
        'order.user',
        'order.user.profile',
        'address',
        'address.city',
        'address.city.state',
        'address.city.state.country',
        'employee',
        'branch',
      ],
    });
    if (!delivery) {
      throw new NotFoundException('Delivery not found.');
    }
    return delivery;
  }

  async updateDelivery(
    user: User,
    deliveryId: string,
    updateData: UpdateDeliveryDTO,
  ): Promise<OrderDelivery> {
    const delivery = await this.orderDeliveryRepository.findOne({
      where: { id: deliveryId },
      relations: [
        'order',
        'order.user',
        'address',
        'address.city',
        'address.city.state',
        'address.city.state.country',
        'employee',
        'branch',
      ],
    });
    if (!delivery) {
      throw new NotFoundException('Delivery not found.');
    }

    const updateDelivery = this.orderDeliveryRepository.merge(
      delivery,
      updateData,
    );
    if (updateData.employeeId) {
      const employee = await this.userService.findUserById(
        updateData.employeeId,
      );
      if (!employee) {
        throw new NotFoundException('Employee not found.');
      }
      if (employee.role !== UserRole.DELIVERY) {
        throw new BadRequestException('User is not an employee.');
      }
      updateDelivery.employee = employee;
    }
    return await this.orderDeliveryRepository.save(updateDelivery);
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
}
