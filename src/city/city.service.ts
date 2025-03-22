import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCityDTO, UpdateCityDTO } from './dto/city.dto';
import { City } from './entities/city.entity';
import { StateService } from 'src/state/state.service';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly stateService: StateService,
  ) {}

  async create(createCityDto: CreateCityDTO): Promise<City> {
    const city = this.cityRepository.create(createCityDto);
    city.state = await this.stateService.findOne(createCityDto.stateId);
    return await this.cityRepository.save(city);
  }

  async findAll(): Promise<City[]> {
    return await this.cityRepository.find({ relations: ['state'] });
  }

  async findOne(id: string): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['state'],
    });
    if (!city) {
      throw new NotFoundException(`City #${id} not found`);
    }
    return city;
  }

  async findByStateId(stateId: string): Promise<City[]> {
    const state = await this.stateService.findOne(stateId);
    return await this.cityRepository.find({
      where: { state: { id: state.id } },
      relations: ['state'],
    });
  }

  async update(id: string, updateCityDto: UpdateCityDTO): Promise<City> {
    const city = await this.findOne(id);
    const updatedCity = { ...city, ...updateCityDto };
    if (updateCityDto.stateId) {
      updatedCity.state = await this.stateService.findOne(
        updateCityDto.stateId,
      );
    }
    return await this.cityRepository.save(updatedCity);
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.cityRepository.delete(id);
    if (!deleted.affected) {
      throw new NotFoundException(`City #${id} not found`);
    }
    return true;
  }
}
