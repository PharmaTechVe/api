import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class UUIDBaseDTO {
  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174006' })
  @IsUUID()
  id: string;
}

export class BaseDTO extends UUIDBaseDTO {
  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty({ example: null })
  deletedAt: Date;
}
