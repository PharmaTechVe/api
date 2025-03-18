import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductPresentationDTO {
  @ApiProperty()
  presentationId: string;

  @ApiProperty()
  price: number;
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
