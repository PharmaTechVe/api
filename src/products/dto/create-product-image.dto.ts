import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';
export class CreateProductImageDto {
  @ApiProperty({ description: 'Url of the image' })
  @IsString()
  @IsUrl()
  url: string;
}
