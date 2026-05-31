import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ThemeService } from './theme.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ThemeResponseDto } from './dto/theme-response.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRoles } from '@RealEstate/types';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.SUPERADMIN)
@ApiTags('Theme')
@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) { }

  @Post()
  @ResponseMessage('Theme created successfully')
  create(@Body() createThemeDto: CreateThemeDto): Promise<ThemeResponseDto> {
    return this.themeService.create(createThemeDto);
  }

  @Get()
  @ResponseMessage('Themes fetched successfully')
  findAll(): Promise<ThemeResponseDto[]> {
    return this.themeService.findAll();
  }

  @Get(':id_theme')
  @ResponseMessage('Theme fetched successfully')
  findOne(@Param('id_theme') id_theme: string): Promise<ThemeResponseDto> {
    return this.themeService.findOne(id_theme);
  }

  @Patch(':id_theme')
  @ResponseMessage('Theme updated successfully')
  update(
    @Param('id_theme') id_theme: string,
    @Body() updateThemeDto: UpdateThemeDto,
  ): Promise<ThemeResponseDto> {
    return this.themeService.update(id_theme, updateThemeDto);
  }

  @Delete(':id_theme')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Theme deleted successfully')
  softDelete(@Param('id_theme') id_theme: string): Promise<ThemeResponseDto> {
    return this.themeService.softDelete(id_theme);
  }
}
