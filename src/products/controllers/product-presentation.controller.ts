import { Controller, Get, Param } from '@nestjs/common';
import { ProductPresentationService } from '../services/product-presentation.service';
import { ProductPresentation } from '../entities/product-presentation.entity';
import { ConfigService } from '@nestjs/config';

@Controller('/product/:id/presentation')
export class ProductPresentationController {
  constructor(
    private productPresentacionServices: ProductPresentationService,
    private configService: ConfigService,
  ) {}

  @Get()
  async getProductPresentations(
    @Param('id') id: string,
  ): Promise<ProductPresentation[]> {
    return this.productPresentacionServices.findByProductId(id);
  }
}
