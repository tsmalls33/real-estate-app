import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ThemeMode } from '@RealEstate/types';

export class UpdateMeDto {
  @ApiProperty({ enum: ThemeMode, example: ThemeMode.SYSTEM })
  @IsEnum(ThemeMode)
  @IsNotEmpty()
  preferredThemeMode: ThemeMode;
}
