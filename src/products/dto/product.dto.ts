import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { ResponseManufacturerDTO } from './manufacturer.dto';
import { CategoryResponseDTO } from 'src/category/dto/category.dto';
import { ResponsePresentationDTO } from './presentation.dto';

export class CreateProductPresentationDTO {
  @ApiProperty()
  @IsString()
  presentationId: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @IsString()
  @IsUUID()
  @IsOptional()
  @ApiProperty({ description: 'The ID of the associated promo' })
  promoId?: string;
}

export class CreateProductDTO {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  genericName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsInt()
  priority: number;

  @ApiProperty()
  @IsUUID()
  manufacturer: string;

  @ApiProperty({
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  categoryIds: string[];

  @ApiProperty({
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageUrls: string[];

  @ApiProperty({
    type: [CreateProductPresentationDTO],
    required: false,
  })
  @IsArray()
  @IsOptional()
  presentations: CreateProductPresentationDTO[];
}

export class ImageDTO extends BaseDTO {
  @ApiProperty()
  url: string;
}

export class LotDTO extends BaseDTO {
  @ApiProperty()
  expirationDate: Date;
}

export class ProductDTO extends BaseDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  genericName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  priority: number;

  @ApiProperty({ type: ResponseManufacturerDTO })
  manufacturer: ResponseManufacturerDTO;

  @ApiProperty({ type: ImageDTO })
  images: ImageDTO[];

  @ApiProperty({ type: [CategoryResponseDTO] })
  categories: CategoryResponseDTO[];
}

export class ProductPresentationDTO extends BaseDTO {
  @ApiProperty()
  price: number;

  @ApiProperty({ type: ResponsePresentationDTO })
  presentation: ResponsePresentationDTO;

  @ApiProperty({ type: ProductDTO })
  product: ProductDTO;
}
