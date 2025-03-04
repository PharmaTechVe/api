import { ApiProperty } from '@nestjs/swagger';

class UUIDBaseDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174006' })
  id: string;
}

export class BaseDTO extends UUIDBaseDTO {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: null })
  deletedAt: Date;
}

export class ManufacturerDTO extends BaseDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}

export class ImagesDTO extends BaseDTO {
  @ApiProperty()
  url: string;
}

export class LotDTO extends BaseDTO {
  @ApiProperty()
  expirationDate: Date;
}

export class CategorieDTO extends UUIDBaseDTO {
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
  meansurementUnit: string;
}

export class PresentationsDTO extends BaseDTO {
  @ApiProperty()
  price: number;

  @ApiProperty()
  presentation: PresentationDTO;
}

export class ProductListDTO extends BaseDTO {
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

  @ApiProperty({ type: ImagesDTO })
  images: ImagesDTO[];

  @ApiProperty({ type: [LotDTO] })
  lot: LotDTO[];

  @ApiProperty({ type: [CategorieDTO] })
  categories: CategorieDTO[];

  @ApiProperty({ type: [PresentationsDTO] })
  presentations: PresentationsDTO[];
}
