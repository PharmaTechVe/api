import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Inventory } from './inventory.entity';

export enum MovementType {
  IN = 'in',
  OUT = 'out',
}

@Entity('inventory_movement')
export class InventoryMovement extends BaseModel {
  @ManyToOne(() => Inventory)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @Column({ type: 'int', name: 'quantity' })
  quantity: number;

  @Column({ type: 'enum', enum: MovementType, name: 'type' })
  type: MovementType;
}
