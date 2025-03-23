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

  async countCities(stateId?: string): Promise<number> {
    if (stateId) {
      const state = await this.stateService.findOne(stateId);
      return await this.cityRepository.count({
        where: { state: { id: state.id } },
      });
    }
    return await this.cityRepository.count();
  }

  async findAll(
    page: number,
    pageSize: number,
    stateId?: string,
  ): Promise<City[]> {
    if (stateId) {
      const state = await this.stateService.findOne(stateId);
      return await this.cityRepository.find({
        where: { state: { id: state.id } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    }
    return await this.cityRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findOne(id: string): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id },
    });
    if (!city) {
      throw new NotFoundException(`City #${id} not found`);
    }
    return city;
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
