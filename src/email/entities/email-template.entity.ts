import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDModel } from 'src/utils/entity';

@Entity()
export class EmailTemplate extends UUIDModel {
  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty({
    description: 'Unique template name',
    example: 'welcome-email',
  })
  name: string;

  @Column({ type: 'text' })
  @ApiProperty({
    description: 'HTML content of the template',
    example: '<h1>Welcome</h1>',
  })
  html: string;

  @Column({ type: 'text' })
  @ApiProperty({
    description: 'Text content of the template',
    example: 'Welcome',
  })
  text: string;
}
