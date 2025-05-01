import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InventoryMovement,
  MovementType,
} from '../entities/inventory-movement.entity';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class InventoryMovementService {
  constructor(
    @InjectRepository(InventoryMovement)
    private movementRepo: Repository<InventoryMovement>,
  ) {}

  async createMovement(
    inventory: Inventory,
    quantity: number,
    type: MovementType,
  ): Promise<InventoryMovement> {
    const movement = this.movementRepo.create({
      inventory,
      quantity,
      type,
    });

    return this.movementRepo.save(movement);
  }
}
