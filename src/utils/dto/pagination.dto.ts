import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { UserRole } from 'src/user/entities/user.entity';

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

export class UserQueryDTO extends PaginationQueryDTO {
  @IsOptional()
  @IsString()
  role?: UserRole;
}

export class GenericProductQueryDTO extends PaginationQueryDTO {
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
