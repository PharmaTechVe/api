import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { AuthModule } from 'src/auth/auth.module';
import { City } from 'src/city/entities/city.entity';
import { CityService } from 'src/city/city.service';
import { StateService } from 'src/state/state.service';
import { CountryService } from 'src/country/country.service';
import { Country } from 'src/country/entities/country.entity';
import { State } from 'src/state/entities/state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, City, State, Country]),
    AuthModule,
  ],
  controllers: [BranchController],
  providers: [BranchService, CityService, StateService, CountryService],
})
export class BranchModule {}
