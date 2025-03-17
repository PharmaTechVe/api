import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductDTO {
  @IsString()
  name: string;

  @IsString()
  genericName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  priority: number;

  @IsUUID()
  manufacturer: string;
}
