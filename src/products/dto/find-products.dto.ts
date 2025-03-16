import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO, UUIDBaseDTO } from 'src/utils/dto/base.dto';

export class ManufacturerDTO extends BaseDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}

export class ImageDTO extends BaseDTO {
  @ApiProperty()
  url: string;
}

export class LotDTO extends BaseDTO {
  @ApiProperty()
  expirationDate: Date;
}

export class CategoryDTO extends UUIDBaseDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}

export class PresentationDTO extends BaseDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  measurementUnit: string;
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

  @ApiProperty({ type: ManufacturerDTO })
  manufacturer: ManufacturerDTO;

  @ApiProperty({ type: ImageDTO })
  images: ImageDTO[];

  @ApiProperty({ type: [CategoryDTO] })
  categories: CategoryDTO[];
}

export class ProductPresentationDTO extends BaseDTO {
  @ApiProperty()
  price: number;

  @ApiProperty({ type: PresentationDTO })
  presentation: PresentationDTO;

  @ApiProperty({ type: ProductDTO })
  product: ProductDTO;
}
