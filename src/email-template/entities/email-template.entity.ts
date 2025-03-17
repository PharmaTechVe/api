import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'ID del template',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Column({ unique: true })
  @ApiProperty({
    description: 'Nombre único del template',
    example: 'welcome-email',
  })
  name: string;

  @Column({ type: 'text' })
  @ApiProperty({
    description: 'Contenido HTML del template',
    example: '<h1>Bienvenido</h1>',
  })
  html: string;
}
