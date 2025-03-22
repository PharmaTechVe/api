import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UUIDBaseDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174006' })
  @IsUUID()
  id: string;
}

export class BaseDTO extends UUIDBaseDTO {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: null })
  deletedAt: Date;
}
