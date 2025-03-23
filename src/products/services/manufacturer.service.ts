import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  CreateManufacturerDTO,
  UpdateManufacturerDTO,
} from '../dto/manufacturer.dto';
import { Manufacturer } from '../entities/manufacturer.entity';
import { CountryService } from 'src/country/country.service';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
    private countryService: CountryService,
  ) {}

  async create(
    createManufacturerDTO: CreateManufacturerDTO,
  ): Promise<Manufacturer> {
    const manufacturer = this.manufacturerRepository.create(
      createManufacturerDTO,
    );
    manufacturer.country = await this.countryService.findOne(
      createManufacturerDTO.countryId,
    );
    return await this.manufacturerRepository.save(manufacturer);
  }

  async countManufacturers(): Promise<number> {
    return await this.manufacturerRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  async findAll(page: number, pageSize: number): Promise<Manufacturer[]> {
    return await this.manufacturerRepository.find({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findOne(id: string): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer #${id} not found`);
    }
    return manufacturer;
  }

  async update(
    id: string,
    updateManufacturerDTO: UpdateManufacturerDTO,
  ): Promise<Manufacturer> {
    const manufacturer = await this.findOne(id);
    if (updateManufacturerDTO.countryId) {
      const country = await this.countryService.findOne(
        updateManufacturerDTO.countryId,
      );
      manufacturer.country = country;
    }
    const manufacturerToUpdate = { ...manufacturer, ...updateManufacturerDTO };
    const updatedManufacturer =
      this.manufacturerRepository.create(manufacturerToUpdate);
    return await this.manufacturerRepository.save(updatedManufacturer);
  }

  async remove(id: string): Promise<boolean> {
    const manufacturer = await this.findOne(id);
    const updated = await this.manufacturerRepository.update(manufacturer.id, {
      deletedAt: new Date(),
    });
    return updated.affected === 1;
  }
}
