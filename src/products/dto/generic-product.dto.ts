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
}
