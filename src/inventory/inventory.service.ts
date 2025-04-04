import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDTO, UpdateInventoryDTO } from './dto/inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { BranchService } from 'src/branch/branch.service';

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
}
