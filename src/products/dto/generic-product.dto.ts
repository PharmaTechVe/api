import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { ResponseManufacturerDTO } from './manufacturer.dto';
import { CategoryDTO } from './find-products.dto';

export class GenericProductDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the product' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the main compose' })
  genericName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Description of the product' })
  description?: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({ description: 'Priority of the product' })
  priority: number;
}

export class CreateGenericProductDTO extends GenericProductDTO {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'Id of the manufacturer' })
  manufacturerId: string;
}

export class UpdateGenericProductDTO extends PartialType(
  CreateGenericProductDTO,
) {}

export class ResponseGenericProductDTO extends IntersectionType(
  GenericProductDTO,
  BaseDTO,
) {
  @ApiProperty({ description: 'Manufacturer of the product' })
  manufacturer: ResponseManufacturerDTO;

  @ApiProperty({
    description: 'List of categories of the product',
    type: [CategoryDTO],
  })
  categories: CategoryDTO[];
}
