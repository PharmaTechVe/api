import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateProductPresentationDTO } from '../dto/product-presentation.dto';

@Controller('/product/:id/presentation')
export class ProductPresentationController {
  constructor(
    private productPresentationService: ProductPresentationService,
    private readonly productService: ProductsService,
    private readonly presentationService: PresentationService,
  ) {}

  @Get()
  async getProductPresentations(
    @Param('id') id: string,
  ): Promise<ProductPresentation[]> {
    return this.productPresentationService.findByProductId(id);
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
    return this.productPresentationService.createProductPresentation(
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
      await this.productPresentationService.findByProductAndPresentationId(
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

  @Patch(':presentationId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('presentationId', new ParseUUIDPipe()) presentationId: string,
    @Body() updateProductPresentationDto: UpdateProductPresentationDTO,
  ): Promise<ProductPresentation> {
    return await this.productPresentationService.update(
      id,
      presentationId,
      updateProductPresentationDto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':presentationId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete produtPresentation by ID' })
  @ApiResponse({
    description: 'Successful deletion of productPresentation',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('presentationId', new ParseUUIDPipe()) presentationId: string,
  ): Promise<void> {
    await this.productPresentationService.remove(id, presentationId);
  }
}
