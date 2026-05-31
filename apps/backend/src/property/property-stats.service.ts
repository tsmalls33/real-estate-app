import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyRepository } from './property.repository';
import { PropertyStatsRepository } from './property-stats.repository';
import { CreatePropertyStatsDto } from './dto/create-property-stats.dto';

@Injectable()
export class PropertyStatsService {
  constructor(
    private readonly propertyStatsRepository: PropertyStatsRepository,
    private readonly propertyRepository: PropertyRepository,
  ) {}

  async upsert(id_property: string, dto: CreatePropertyStatsDto) {
    const exists = await this.propertyRepository.existsById(id_property);
    if (!exists) throw new NotFoundException(`Property with id '${id_property}' not found`);

    return this.propertyStatsRepository.upsert(id_property, { ...dto, id_property });
  }
}
