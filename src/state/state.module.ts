import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { StateController } from './state.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CountryService } from 'src/country/country.service';
import { Country } from 'src/country/entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([State, Country]), AuthModule],
  controllers: [StateController],
  providers: [StateService, CountryService],
})
export class StateModule {}
