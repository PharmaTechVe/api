import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { ProductPresentation } from 'src/products/entities/product-presentation.entity';
import { BranchService } from 'src/branch/branch.service';
import { CityService } from 'src/city/city.service';
import { City } from 'src/city/entities/city.entity';
import { StateService } from 'src/state/state.service';
import { CountryService } from 'src/country/country.service';
import { State } from 'src/state/entities/state.entity';
import { Country } from 'src/country/entities/country.entity';
import { AuthModule } from 'src/auth/auth.module';
import { InventorySubscriber } from '../inventory/subscribers/inventory.subscriber';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { InventoryMovementService } from './services/inventory-movement.service';
import { Lot } from 'src/products/entities/lot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      Branch,
      ProductPresentation,
      City,
      State,
      Country,
      InventoryMovement,
      Lot,
    ]),
    AuthModule,
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    BranchService,
    CityService,
    StateService,
    CountryService,
    InventorySubscriber,
    InventoryMovementService,
  ],
  exports: [InventoryService, TypeOrmModule, InventoryMovementService],
})
export class InventoryModule {}
