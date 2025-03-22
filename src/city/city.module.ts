import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { StateService } from 'src/state/state.service';
import { AuthModule } from 'src/auth/auth.module';
import { State } from 'src/state/entities/state.entity';
import { CountryService } from 'src/country/country.service';
import { Country } from 'src/country/entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([City, State, Country]), AuthModule],
  controllers: [CityController],
  providers: [CityService, StateService, CountryService],
})
export class CityModule {}
