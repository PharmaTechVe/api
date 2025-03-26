import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

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
  pageSize: number;

  constructor(page: number, pageSize: number) {
    this.page = page ? page : 1;
    this.pageSize = pageSize ? pageSize : 10;
  }

  calculateSkip() {
    return (this.page - 1) * this.pageSize;
  }
}
