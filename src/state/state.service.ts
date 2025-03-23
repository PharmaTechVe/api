import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStateDTO, UpdateStateDTO } from './dto/state.dto';
import { State } from './entities/state.entity';
import { CountryService } from 'src/country/country.service';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    private countryService: CountryService,
  ) {}

  async create(createStateDto: CreateStateDTO): Promise<State> {
    const state = this.stateRepository.create(createStateDto);
    state.country = await this.countryService.findOne(createStateDto.countryId);
    return await this.stateRepository.save(state);
  }

  async countStates(countryId?: string): Promise<number> {
    if (countryId) {
      return await this.stateRepository.count({
        where: { country: { id: countryId } },
      });
    }
    return await this.stateRepository.count();
  }

  async findAll(
    page: number,
    pageSize: number,
    countryId?: string,
  ): Promise<State[]> {
    if (countryId) {
      return await this.stateRepository.find({
        where: { country: { id: countryId } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    }
    return await this.stateRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findOne(id: string): Promise<State> {
    const state = await this.stateRepository.findOne({ where: { id } });
    if (!state) {
      throw new NotFoundException(`State #${id} not found`);
    }
    return state;
  }

  async update(id: string, updateStateDto: UpdateStateDTO): Promise<State> {
    const state = await this.findOne(id);
    const updatedState = { ...state, ...updateStateDto };
    return await this.stateRepository.save(updatedState);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.stateRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`State #${id} not found`);
    }
    return true;
  }
}
