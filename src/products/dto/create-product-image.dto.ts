import { ApiProperty } from '@nestjs/swagger';
export class CreateProductImageDto {
  @ApiProperty({ description: 'Url of the image' })
  url: string;
}
