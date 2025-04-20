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
    const totalPrice = productsWithQuantity.reduce((acc, product) => {
      const price = product.promo
        ? product.price - (product.price * product.promo.discount) / 100
        : product.price;
      return acc + price * product.quantity;
    }, 0);
    const orderToCreate = this.orderRepository.create({
      user,
      branch,
      type: createOrderDTO.type,
      totalPrice,
    });
    const order = await this.orderRepository.save(orderToCreate);
    const orderDetails = productsWithQuantity.map((product) => {
      return this.orderDetailRepository.create({
        order,
        productPresentation: product,
        quantity: product.quantity,
        subtotal: product.promo
          ? (product.price - (product.price * product.promo.discount) / 100) *
            product.quantity
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
  async update(id: string, status: OrderStatus) {
    const order = await this.findOne(id);
    if (!order) {
      throw new BadRequestException('Order not found');
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
}
