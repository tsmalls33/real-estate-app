import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ThemeMode, Language } from '@RealEstate/types';

export class UpdateMeDto {
  @ApiProperty({ enum: ThemeMode, example: ThemeMode.SYSTEM, required: false })
  @IsEnum(ThemeMode)
  @IsOptional()
  preferredThemeMode?: ThemeMode;

  @ApiProperty({ enum: Language, example: Language.EN, required: false })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
