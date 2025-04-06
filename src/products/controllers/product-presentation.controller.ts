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
import { CreateProductPresentationDTO } from '../dto/product.dto';
import { ProductsService } from '../products.service';
import { PresentationService } from '../services/presentation.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { UserRole } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ResponseProductPresentationDetailDTO,
  ResponseProductPresentationDTO,
  UpdateProductPresentationDTO,
} from '../dto/product-presentation.dto';

@Controller('/product/:id/presentation')
export class ProductPresentationController {
  constructor(
    private productPresentationService: ProductPresentationService,
    private readonly productService: ProductsService,
    private readonly presentationService: PresentationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all product presentations by product Id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of product presentations',
    type: ResponseProductPresentationDTO,
    isArray: true,
  })
  async getProductPresentations(
    @Param('id') id: string,
  ): Promise<ResponseProductPresentationDTO[]> {
    return this.productPresentationService.findByProductId(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product presentation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product presentation created successfully',
    type: ResponseProductPresentationDTO,
  })
  async createProductPresentation(
    @Param('id') productId: string,
    @Body() createProductPresentationDto: CreateProductPresentationDTO,
  ): Promise<ResponseProductPresentationDTO> {
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
  @ApiOperation({
    summary: 'Get product presentation by product and presentation ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product presentation found',
    type: ResponseProductPresentationDetailDTO,
  })
  async getProductPresentationDetail(
    @Param('id') productId: string,
    @Param('presentationId') presentationId: string,
  ): Promise<ResponseProductPresentationDetailDTO> {
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
  @ApiOperation({ summary: 'Update product presentation by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product presentation updated successfully',
    type: ResponseProductPresentationDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('presentationId', new ParseUUIDPipe()) presentationId: string,
    @Body() updateProductPresentationDto: UpdateProductPresentationDTO,
  ): Promise<ResponseProductPresentationDTO> {
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
