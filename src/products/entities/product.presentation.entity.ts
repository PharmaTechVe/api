import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Presentation } from './presentation.entity';

@Entity('product_presentation')
export class ProductPresentation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.presentations)
  @JoinColumn({ name: 'product_id' })
  product_id: Product;

  @ManyToOne(() => Presentation, (presentation) => presentation.presentations)
  @JoinColumn({ name: 'presentation_id' })
  presentation_id: Presentation;

  @Column({ type: 'int' })
  price: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
