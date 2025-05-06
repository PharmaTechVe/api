import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { ResponseManufacturerDTO } from './manufacturer.dto';
import { CategoryResponseDTO } from 'src/category/dto/category.dto';
import { ResponsePresentationDTO } from './presentation.dto';
import { PaginationQueryDTO } from 'src/utils/dto/pagination.dto';
import { Expose, Transform, Type } from 'class-transformer';

export class AddCategoryDTO {
  @IsString()
  @IsUUID()
  @ApiProperty({ description: 'Id of the category' })
  categoryId: string;
}

export class ImageDTO extends BaseDTO {
  @Expose()
  @ApiProperty()
  url: string;
}

export class LotDTO extends BaseDTO {
  @ApiProperty()
  expirationDate: Date;
}

export class ProductDTO extends BaseDTO {
  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  genericName: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  priority: number;

  @Expose()
  @ApiProperty({ type: ResponseManufacturerDTO })
  @Type(() => ResponseManufacturerDTO)
  manufacturer: ResponseManufacturerDTO;

  @Expose()
  @ApiProperty({ type: ImageDTO })
  @Type(() => ImageDTO)
  images: ImageDTO[];

  @Expose()
  @ApiProperty({ type: [CategoryResponseDTO] })
  @Type(() => CategoryResponseDTO)
  categories: CategoryResponseDTO[];
}

export class ProductPresentationDTO extends BaseDTO {
  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty()
  isVisible: boolean;

  @Expose()
  @ApiProperty({ type: ResponsePresentationDTO })
  @Type(() => ResponsePresentationDTO)
  presentation: ResponsePresentationDTO;

  @Expose()
  @ApiProperty({ type: ProductDTO })
  @Type(() => ProductDTO)
  product: ProductDTO;

  @Expose()
  @ApiProperty({ description: 'Stock quantity in all branches' })
  stock: number;
}

export class ProductQueryDTO extends PaginationQueryDTO {
  @IsOptional()
  @Transform(({ value }: { value: string }) => (value ? value.split(',') : []))
  @IsUUID(undefined, { each: true })
  id: string[];

  @IsOptional()
  @Transform(({ value }: { value: string }) => (value ? value.split(',') : []))
  @IsUUID(undefined, { each: true })
  manufacturerId: string[];

  @IsOptional()
  @Transform(({ value }: { value: string }) => (value ? value.split(',') : []))
  @IsUUID(undefined, { each: true })
  categoryId: string[];

  @IsOptional()
  @Transform(({ value }: { value: string }) => (value ? value.split(',') : []))
  @IsUUID(undefined, { each: true })
  branchId: string[];

  @IsOptional()
  @Transform(({ value }: { value: string }) => (value ? value.split(',') : []))
  @IsUUID(undefined, { each: true })
  presentationId: string[];

  @IsOptional()
  @Transform(({ value }: { value: string }) => (value ? value.split(',') : []))
  @IsUUID(undefined, { each: true })
  genericProductId: string[];

  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value ? value.split(',').map(Number) : [],
  )
  @IsInt({ each: true })
  priceRange: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isVisible?: boolean;

  constructor(
    page: number,
    limit: number,
    q?: string,
    manufacturerId?: string[],
    categoryId?: string[],
    branchId?: string[],
    presentationId?: string[],
    genericProductId?: string[],
    priceRange?: number[],
    isVisible?: boolean,
    id?: string[],
  ) {
    super(page, limit);
    this.q = q ? q : '';
    this.manufacturerId = manufacturerId ? manufacturerId : [];
    this.categoryId = categoryId ? categoryId : [];
    this.branchId = branchId ? branchId : [];
    this.presentationId = presentationId ? presentationId : [];
    this.genericProductId = genericProductId ? genericProductId : [];
    this.priceRange = priceRange ? priceRange : [];
    this.isVisible = isVisible;
    this.id = id ? id : [];
  }
}
