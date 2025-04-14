import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class UpdateUserMotoDTO {
  @ApiPropertyOptional({ description: 'Motorcycle brand', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  brand?: string;

  @ApiPropertyOptional({ description: 'Motorcycle model', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @ApiPropertyOptional({ description: 'Motorcycle color', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  color?: string;

  @ApiPropertyOptional({ description: 'Motorcycle plate', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  plate?: string;

  @ApiPropertyOptional({
    description: 'URL of the motorcycle license',
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  licenseUrl?: string;
}
