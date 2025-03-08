import { ApiProperty } from '@nestjs/swagger';

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
