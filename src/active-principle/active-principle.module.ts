import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivePrinciple } from './entities/active-principle.entity';
import { ActivePrincipleController } from './active-principle.controller';
import { ActivePrincipleService } from './active-principle.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ActivePrinciple]), AuthModule],
  controllers: [ActivePrincipleController],
  providers: [ActivePrincipleService],
})
export class ActivePrincipleModule {}
