import { IntersectionType } from '@nestjs/swagger';
import { BaseDTO } from 'src/utils/dto/base.dto';

export class CreateProductDTO {
  name: string;
  description: string;
  priority: number;
  manufacturerId: string;
}

export class CreateProductResponseDTO extends IntersectionType(
  CreateProductDTO,
  BaseDTO,
) {}
