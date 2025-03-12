import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class EmailTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('text')
  html: string;
}
