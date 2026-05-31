import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateThemeDto as SharedUpdateThemeDto } from '@RealEstate/types';

export class UpdateThemeDto implements SharedUpdateThemeDto {
  @ApiProperty({ required: false, example: 'Default' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: '#1976d2' })
  @IsOptional()
  @IsString()
  primary?: string;

  @ApiProperty({ required: false, example: '#9c27b0' })
  @IsOptional()
  @IsString()
  secondary?: string;

  @ApiProperty({ required: false, example: '#ff9800' })
  @IsOptional()
  @IsString()
  accent?: string;

  @ApiProperty({ required: false, example: 'logoicon.com' })
  @IsOptional()
  @IsString()
  logoIcon?: string | null;

  @ApiProperty({ required: false, example: 'logobanner.com' })
  @IsOptional()
  @IsString()
  logoBanner?: string | null;
}
