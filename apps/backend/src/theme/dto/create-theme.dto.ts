import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateThemeDto as SharedCreateThemeDto } from '@RealEstate/types';

export class CreateThemeDto implements SharedCreateThemeDto {
  @ApiProperty({ required: true, example: 'Default' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, example: '#1976d2' })
  @IsString()
  primary: string;

  @ApiProperty({ required: true, example: '#9c27b0' })
  @IsString()
  secondary: string;

  @ApiProperty({ required: true, example: '#ff9800' })
  @IsString()
  accent: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoIcon?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoBanner?: string | null;
}
