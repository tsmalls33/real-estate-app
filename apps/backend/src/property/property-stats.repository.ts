import { Injectable } from '@nestjs/common';
import { Prisma, PropertyStats } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertyStatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPropertyId(id_property: string): Promise<PropertyStats | null> {
    return this.prisma.propertyStats.findFirst({
      where: { id_property, isDeleted: false },
    });
  }

  async upsert(
    id_property: string,
    data: Prisma.PropertyStatsUncheckedCreateInput,
  ): Promise<PropertyStats> {
    return this.prisma.propertyStats.upsert({
      where: { id_property },
      create: data,
      update: data,
    });
  }
}
