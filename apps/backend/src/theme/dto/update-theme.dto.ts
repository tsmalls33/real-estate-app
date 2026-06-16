import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateThemeDto as SharedUpdateThemeDto } from '@RealEstate/types';

export class UpdateThemeDto implements SharedUpdateThemeDto {
  @ApiProperty({ required: false, example: 'Default' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: '#FAFAFA', description: 'Page background color' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiProperty({ required: false, example: '#1976d2', description: 'Main brand color — primary CTAs, active states' })
  @IsOptional()
  @IsString()
  brandColor?: string;

  @ApiProperty({ required: false, example: '#ff9800', description: 'Secondary brand accent' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiProperty({ required: false, example: 'logoicon.com' })
  @IsOptional()
  @IsString()
  logoIcon?: string | null;

  @ApiProperty({ required: false, example: 'logobanner.com' })
  @IsOptional()
  @IsString()
  logoBanner?: string | null;
}
