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
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { BranchService } from 'src/branch/branch.service';
import { In } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly branchService: BranchService,
    @InjectRepository(ProductPresentation)
    private readonly productPresentationRepository: Repository<ProductPresentation>,
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

  async countInventories(
    branchId?: string,
    productPresentationId?: string,
  ): Promise<number> {
    return await this.inventoryRepository.count({
      relations: ['branch', 'productPresentation'],
      where: {
        branch: branchId ? { id: branchId } : undefined,
        productPresentation: productPresentationId
          ? { id: productPresentationId }
          : undefined,
      },
    });
  }

  async findAll(
    page: number,
    pageSize: number,
    branchId?: string,
    productPresentationId?: string,
  ): Promise<Inventory[]> {
    return await this.inventoryRepository.find({
      relations: ['branch', 'productPresentation'],
      where: {
        branch: branchId ? { id: branchId } : undefined,
        productPresentation: productPresentationId
          ? { id: productPresentationId }
          : undefined,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }
    return inventory;
  }

  async update(
    id: string,
    updateInventoryDTO: UpdateInventoryDTO,
  ): Promise<Inventory> {
    const inventory = await this.findOne(id);
    const updatedInventory = { ...inventory, ...updateInventoryDTO };
    return await this.inventoryRepository.save(updatedInventory);
  }

  async remove(id: string): Promise<boolean> {
    const inventory = await this.findOne(id);
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
    const toUpdate = bulkUpdateDto.inventories
      .filter((item) => !!inventoryMap[item.productPresentationId])
      .map((item) => {
        const inv = inventoryMap[item.productPresentationId];
        inv.stockQuantity = item.quantity;
        return inv;
      });

    return this.inventoryRepository.save(toUpdate);
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
    const inv = await this.inventoryRepository.findOne({
      where: {
        productPresentation: { id: presentationId },
        branch: { id: branchId },
      },
    });
    if (!inv || inv.stockQuantity < amount) {
      throw new BadRequestException(
        'Insufficient branch inventory to approve order',
      );
    }
    inv.stockQuantity -= amount;
    await this.inventoryRepository.save(inv);
  }
}
