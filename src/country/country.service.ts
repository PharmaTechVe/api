import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CountryDTO, UpdateCountryDTO } from './dto/country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async create(createCountryDto: CountryDTO): Promise<Country> {
    const country = this.countryRepository.create(createCountryDto);
    return await this.countryRepository.save(country);
  }

  async countCountries(): Promise<number> {
    return await this.countryRepository.count();
  }

  async findAll(page: number, pageSize: number): Promise<Country[]> {
    return await this.countryRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findOne(id: string): Promise<Country> {
    const country = await this.countryRepository.findOne({ where: { id } });
    if (!country) {
      throw new NotFoundException(`Country #${id} not found`);
    }
    return country;
  }

  async update(
    id: string,
    updateCountryDto: UpdateCountryDTO,
  ): Promise<Country> {
    const updated = await this.countryRepository.update(id, updateCountryDto);
    if (!updated.affected) {
      throw new NotFoundException(`Country #${id} not found`);
    }
    return await this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.countryRepository.delete(id);
    if (!deleted.affected) {
      throw new NotFoundException(`Country #${id} not found`);
    }
    return true;
  }
}
