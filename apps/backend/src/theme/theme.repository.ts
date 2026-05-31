import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Theme, Prisma } from '@prisma/client';

@Injectable()
export class ThemeRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<Theme[]> {
    return await this.prisma.theme.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id_theme: string): Promise<Theme | null> {
    return await this.prisma.theme.findUnique({
      where: { id_theme, isDeleted: false },
    });
  }

  async existsById(id_theme: string): Promise<boolean> {
    const theme = await this.prisma.theme.findUnique({
      where: { id_theme, isDeleted: false },
      select: { id_theme: true },
    });
    return theme !== null;
  }

  async create(data: Prisma.ThemeCreateInput): Promise<Theme> {
    return await this.prisma.theme.create({ data });
  }

  async update(id_theme: string, data: Prisma.ThemeUpdateInput): Promise<Theme> {
    return await this.prisma.theme.update({
      where: { id_theme },
      data,
    });
  }

  async softDelete(id_theme: string): Promise<Theme> {
    return await this.prisma.theme.update({
      where: { id_theme },
      data: { isDeleted: true },
    });
  }
}
