import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ProductPresentation } from '../entities/product-presentation.entity';

@Entity({ name: 'promo' })
export class Promo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'product_presentation_id' })
  productPresentationId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int' })
  discount: number;

  @Column({ type: 'timestamp with time zone' })
  expired_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => ProductPresentation, (presentation) => presentation.promos)
  @JoinColumn({ name: 'product_presentation_id' })
  productPresentation: ProductPresentation;
}
