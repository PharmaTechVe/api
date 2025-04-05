import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class CreateProductImageDTO {
  @ApiProperty({ description: 'Url of the image' })
  @IsString()
  @IsUrl()
  url: string;
}

export class UpdateProductImageDTO extends PartialType(CreateProductImageDTO) {}
