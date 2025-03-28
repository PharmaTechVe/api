import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProductPresentationService } from '../services/product-presentation.service';
import { ProductPresentation } from '../entities/product-presentation.entity';
import { ConfigService } from '@nestjs/config';
import { CreateProductPresentationDTO } from '../dto/create-product.dto';
import { ProductsService } from '../products.service';
import { PresentationService } from '../services/presentation.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('/product/:id/presentation')
export class ProductPresentationController {
  constructor(
    private productPresentacionServices: ProductPresentationService,
    private readonly productService: ProductsService,
    private readonly presentationService: PresentationService,
    private configService: ConfigService,
  ) {}

  @Get()
  async getProductPresentations(
    @Param('id') id: string,
  ): Promise<ProductPresentation[]> {
    return this.productPresentacionServices.findByProductId(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async createProductPresentation(
    @Param('id') productId: string,
    @Body() createProductPresentationDto: CreateProductPresentationDTO,
  ): Promise<ProductPresentation> {
    const product = await this.productService.findOne(productId);
    const presentation = await this.presentationService.findOne(
      createProductPresentationDto.presentationId,
    );
    return this.productPresentacionServices.createProductPresentation(
      product,
      presentation,
      createProductPresentationDto,
    );
  }
}
