import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class PaginationDTO<T> {
  @ApiProperty()
  results: T[];

  @ApiProperty()
  count: number;

  @ApiProperty()
  next: string | null;

  @ApiProperty()
  previous: string | null;
}

export class PaginationQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;

  @IsOptional()
  @IsString()
  q?: string;

  constructor(page: number, limit: number) {
    this.page = page ? page : 1;
    this.limit = limit ? limit : 10;
  }

  calculateSkip() {
    return (this.page - 1) * this.limit;
  }
}

export class BranchQueryDTO extends PaginationQueryDTO {
  @IsOptional()
  @IsUUID()
  stateId?: string;
}
