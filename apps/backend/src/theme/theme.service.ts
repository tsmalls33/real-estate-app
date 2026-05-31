import { Injectable, NotFoundException } from '@nestjs/common';
import { ThemeRepository } from './theme.repository';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ThemeResponseDto } from './dto/theme-response.dto';

@Injectable()
export class ThemeService {
  constructor(private readonly themeRepository: ThemeRepository) { }

  async create(createThemeDto: CreateThemeDto): Promise<ThemeResponseDto> {
    return this.themeRepository.create(createThemeDto) as Promise<ThemeResponseDto>;
  }

  async findAll(): Promise<ThemeResponseDto[]> {
    return this.themeRepository.findAll() as Promise<ThemeResponseDto[]>;
  }

  async findOne(id_theme: string): Promise<ThemeResponseDto> {
    const theme = await this.themeRepository.findById(id_theme);
    if (!theme) throw new NotFoundException(`Theme with id '${id_theme}' not found`);
    return theme as ThemeResponseDto;
  }

  async update(id_theme: string, updateThemeDto: UpdateThemeDto): Promise<ThemeResponseDto> {
    const themeExists = await this.themeRepository.existsById(id_theme);
    if (!themeExists) throw new NotFoundException(`Theme with id '${id_theme}' not found`);
    return this.themeRepository.update(id_theme, updateThemeDto) as Promise<ThemeResponseDto>;
  }

  async softDelete(id_theme: string): Promise<ThemeResponseDto> {
    const themeExists = await this.themeRepository.existsById(id_theme);
    if (!themeExists) throw new NotFoundException(`Theme with id '${id_theme}' not found`);
    return this.themeRepository.softDelete(id_theme) as Promise<ThemeResponseDto>;
  }
}
