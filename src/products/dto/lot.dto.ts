import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';
import { ResponseBranchDTO } from 'src/branch/dto/branch.dto';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { ProductPresentationDTO } from './product.dto';

export class LotDTO {
  @Expose()
  quantity: number;

  @Expose()
  expirationDate: Date;
}

export class LotQueryDTO extends PaginationQueryDTO {
  @ApiProperty({ description: 'The branch id of the lot' })
  @IsOptional()
  @IsUUID()
  branchId: string;

  @ApiProperty({ description: 'The product presentation id of the lot' })
  @IsOptional()
  @IsUUID()
  productPresentationId: string;
}

export class ResponseLotDTO extends IntersectionType(LotDTO, BaseDTO) {
  @Expose()
  @ApiProperty({
    description: 'The branch in wich the product is available',
    type: ResponseBranchDTO,
  })
  branch: ResponseBranchDTO;

  @Expose()
  @ApiProperty({
    description: 'The product presentation of the product in the lot',
    type: ProductPresentationDTO,
  })
  productPresentation: ProductPresentationDTO;
}
