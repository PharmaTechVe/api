import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateInventoryDTO,
  UpdateInventoryDTO,
  BulkUpdateInventoryDTO,
} from './dto/inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { BranchService } from 'src/branch/branch.service';
import { In } from 'typeorm';
import { Lot } from 'src/products/entities/lot.entity';
import {
  InventoryMovement,
  MovementType,
} from './entities/inventory-movement.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly branchService: BranchService,
    @InjectRepository(ProductPresentation)
    private readonly productPresentationRepository: Repository<ProductPresentation>,
    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,

    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementRepository: Repository<InventoryMovement>,
  ) {}

  async create(createInventoryDTO: CreateInventoryDTO): Promise<Inventory> {
    const inventory = this.inventoryRepository.create(createInventoryDTO);
    inventory.branch = await this.branchService.findOne(
      createInventoryDTO.branchId,
    );
    inventory.productPresentation =
      await this.productPresentationRepository.findOneByOrFail({
        id: createInventoryDTO.productPresentationId,
      });
    return await this.inventoryRepository.save(inventory);
  }

  async findAll(
    page: number,
    pageSize: number,
    branchId?: string,
    productPresentationId?: string,
  ): Promise<[Inventory[], number]> {
    const query = this.inventoryRepository.createQueryBuilder('inventory');
    query
      .innerJoinAndSelect('inventory.branch', 'branch')
      .innerJoinAndSelect('branch.city', 'city')
      .innerJoinAndSelect('city.state', 'state')
      .innerJoinAndSelect('state.country', 'country')
      .innerJoinAndSelect(
        'inventory.productPresentation',
        'productPresentation',
      )
      .innerJoinAndSelect('productPresentation.product', 'product')
      .innerJoinAndSelect('productPresentation.presentation', 'presentation')
      .innerJoinAndSelect('product.manufacturer', 'manufacturer');
    if (branchId) {
      query.andWhere('branch.id = :branchId', { branchId });
    }
    if (productPresentationId) {
      query.andWhere('productPresentation.id = :productPresentationId', {
        productPresentationId,
      });
    }
    query.orderBy('inventory.createdAt', 'DESC');
    query.skip((page - 1) * pageSize);
    query.take(pageSize);
    const [inventories, total] = await query.getManyAndCount();
    return [inventories, total];
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }
    return inventory;
  }

  async findByPresentationAndBranch(
    productPresentationId: string,
    branchId: string,
  ): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        productPresentation: { id: productPresentationId },
        branch: { id: branchId },
      },
    });
    if (!inventory) {
      throw new NotFoundException(
        `Inventory with product presentation #${productPresentationId} not found`,
      );
    }
    return inventory;
  }

  async update(
    id: string,
    updateInventoryDTO: UpdateInventoryDTO,
    branchId?: string,
  ): Promise<Inventory> {
    let where: FindOneOptions<Inventory> = { where: { id } };
    if (branchId) {
      where = {
        where: { id, branch: { id: branchId } },
      };
    }
    const inventory = await this.inventoryRepository.findOne(where);
    if (!inventory) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }
    const delta = updateInventoryDTO.stockQuantity! - inventory.stockQuantity;
    const movement = this.inventoryMovementRepository.create({
      inventory,
      quantity: Math.abs(delta),
      type: delta > 0 ? MovementType.IN : MovementType.OUT,
    });
    const updatedInventory = { ...inventory, ...updateInventoryDTO };
    await this.inventoryMovementRepository.save(movement);
    return await this.inventoryRepository.save(updatedInventory);
  }

  async remove(id: string, branchId?: string): Promise<boolean> {
    let where: FindOneOptions<Inventory> = { where: { id } };
    if (branchId) {
      where = {
        where: { id, branch: { id: branchId } },
      };
    }
    const inventory = await this.inventoryRepository.findOne(where);
    if (!inventory) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }
    const deleted = await this.inventoryRepository.softDelete(inventory.id);
    if (!deleted.affected) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }
    return true;
  }
  private getProductPresentationIds(
    bulkUpdateDto: BulkUpdateInventoryDTO,
  ): string[] {
    return bulkUpdateDto.inventories.map((item) => item.productPresentationId);
  }
  private async findInventories(
    branchId: string,
    productPresentationIds: string[],
  ): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: {
        branch: { id: branchId },
        productPresentation: { id: In(productPresentationIds) },
      },
      relations: ['branch', 'productPresentation'],
    });
  }
  private buildInventoryMap(
    inventories: Inventory[],
  ): Record<string, Inventory> {
    return inventories.reduce(
      (map, inv) => {
        map[inv.productPresentation.id] = inv;
        return map;
      },
      {} as Record<string, Inventory>,
    );
  }
  private async applyBulkUpdate(
    branchId: string,
    bulkUpdateDto: BulkUpdateInventoryDTO,
    inventoryMap: Record<string, Inventory>,
  ): Promise<Inventory[]> {
    const inventoriesToSave: Inventory[] = [];
    const movementsToSave: InventoryMovement[] = [];

    const totalByPresentation: Record<string, number> = {};
    for (const item of bulkUpdateDto.inventories) {
      totalByPresentation[item.productPresentationId] =
        (totalByPresentation[item.productPresentationId] || 0) + item.quantity;
    }

    const updatedPresentation: Record<string, boolean> = {};

    const originalStockMap: Record<string, number> = {};
    for (const key of Object.keys(inventoryMap)) {
      originalStockMap[key] = inventoryMap[key].stockQuantity;
    }

    const lotMap = new Map<
      string,
      { quantity: number; expirationDate: Date }
    >();

    for (const item of bulkUpdateDto.inventories) {
      const inventory = inventoryMap[item.productPresentationId];
      if (!inventory) continue;

      if (!updatedPresentation[item.productPresentationId]) {
        const originalQty = originalStockMap[item.productPresentationId];
        const newTotalQty = totalByPresentation[item.productPresentationId];

        inventory.stockQuantity = newTotalQty;
        inventoriesToSave.push(inventory);

        const delta = newTotalQty - originalQty;
        if (delta !== 0) {
          const movement = this.inventoryMovementRepository.create({
            inventory,
            quantity: Math.abs(delta),
            type: delta > 0 ? MovementType.IN : MovementType.OUT,
          });
          movementsToSave.push(movement);
        }
        updatedPresentation[item.productPresentationId] = true;
      }

      if (item.expirationDate) {
        const expDate =
          item.expirationDate instanceof Date
            ? item.expirationDate
            : new Date(item.expirationDate);
        const key = `${item.productPresentationId}_${expDate.toISOString()}`;
        if (lotMap.has(key)) {
          lotMap.get(key)!.quantity += item.quantity;
        } else {
          lotMap.set(key, {
            quantity: item.quantity,
            expirationDate: expDate,
          });
        }
      }
    }

    const updatedInventories =
      await this.inventoryRepository.save(inventoriesToSave);
    if (movementsToSave.length > 0) {
      await this.inventoryMovementRepository.save(movementsToSave);
    }

    for (const [key, info] of lotMap.entries()) {
      const [presentationId] = key.split('_');

      const existingLot = await this.lotRepository.findOne({
        where: {
          productPresentation: { id: presentationId },
          branch: { id: branchId },
          expirationDate: info.expirationDate,
        },
      });

      if (existingLot) {
        existingLot.quantity = info.quantity;
        await this.lotRepository.save(existingLot);
      } else {
        const newLot = this.lotRepository.create({
          productPresentation: { id: presentationId },
          branch: { id: branchId },
          quantity: info.quantity,
          expirationDate: info.expirationDate,
        });
        await this.lotRepository.save(newLot);
      }
    }

    return updatedInventories;
  }

  async updateBulkByBranch(
    branchId: string,
    bulkUpdateDto: BulkUpdateInventoryDTO,
  ): Promise<Inventory[]> {
    const ids = this.getProductPresentationIds(bulkUpdateDto);
    const inventories = await this.findInventories(branchId, ids);
    const inventoryMap = this.buildInventoryMap(inventories);
    return this.applyBulkUpdate(branchId, bulkUpdateDto, inventoryMap);
  }
  async getBulkTotalInventory(
    presentationIds: string[],
  ): Promise<Record<string, number>> {
    const rows = await this.inventoryRepository
      .createQueryBuilder('inv')
      .select('inv.product_presentation_id', 'presentationId')
      .addSelect('SUM(inv.stock_quantity)', 'totalStock')
      .where('inv.product_presentation_id IN (:...ids)', {
        ids: presentationIds,
      })
      .groupBy('inv.product_presentation_id')
      .getRawMany<{ presentationId: string; totalStock: string }>();

    const inventoryMap: Record<string, number> = {};
    for (const { presentationId, totalStock } of rows) {
      inventoryMap[presentationId] = Number(totalStock);
    }
    return inventoryMap;
  }
  async decrementInventory(
    presentationId: string,
    branchId: string,
    amount: number,
  ): Promise<void> {
    const inv = await this.findByPresentationAndBranch(
      presentationId,
      branchId,
    );
    if (!inv || inv.stockQuantity < amount) {
      throw new BadRequestException(
        'Insufficient branch inventory to approve order',
      );
    }
    inv.stockQuantity -= amount;
    await this.inventoryRepository.save(inv);
  }
}
