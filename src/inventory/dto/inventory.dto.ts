import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ResponseBranchDTO } from 'src/branch/dto/branch.dto';
import { BaseDTO } from 'src/utils/dto/base.dto';

export class InventoryDTO {
  @ApiProperty({ description: 'The stock quantity of the inventory' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  stockQuantity: number;
}

export class CreateInventoryDTO extends InventoryDTO {
  @ApiProperty({ description: 'The product presentation id of the inventory' })
  @IsNotEmpty()
  @IsUUID()
  productPresentationId: string;

  @ApiProperty({ description: 'The branch id of the inventory' })
  @IsNotEmpty()
  @IsUUID()
  branchId: string;
}

export class UpdateInventoryDTO extends PartialType(InventoryDTO) {}

class ProductPresentationDTO extends BaseDTO {
  @ApiProperty({ description: 'The price of the product presentation' })
  price: number;
}

export class ResponseInventoryDTO extends IntersectionType(
  InventoryDTO,
  BaseDTO,
) {
  @ApiProperty({ description: 'The branch in wich the product is available' })
  branch: ResponseBranchDTO;

  @ApiProperty({
    description: 'The product presentation of the product in the inventory',
  })
  productPresentation: ProductPresentationDTO;
}
