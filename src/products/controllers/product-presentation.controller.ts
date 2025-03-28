import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductPresentationService } from '../services/product-presentation.service';
import { ProductPresentation } from '../entities/product-presentation.entity';
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
    private productPresentationServices: ProductPresentationService,
    private readonly productService: ProductsService,
    private readonly presentationService: PresentationService,
  ) {}

  @Get()
  async getProductPresentations(
    @Param('id') id: string,
  ): Promise<ProductPresentation[]> {
    return this.productPresentationServices.findByProductId(id);
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
    return this.productPresentationServices.createProductPresentation(
      product,
      presentation,
      createProductPresentationDto,
    );
  }

  @Get(':presentationId')
  async getProductPresentationDetail(
    @Param('id') productId: string,
    @Param('presentationId') presentationId: string,
  ): Promise<ProductPresentation> {
    const productPresentation =
      await this.productPresentationServices.findByProductAndPresentationId(
        productId,
        presentationId,
      );

    if (!productPresentation) {
      throw new NotFoundException(
        'Product presentation not found for the given IDs',
      );
    }

    return productPresentation;
  }
}
