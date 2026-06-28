import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateThemeDto as SharedCreateThemeDto } from '@RealEstate/types';

export class CreateThemeDto implements SharedCreateThemeDto {
  @ApiProperty({ required: true, example: 'Default' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    example: '#FAFAFA',
    description: 'Page background color',
  })
  @IsString()
  backgroundColor: string;

  @ApiProperty({
    required: true,
    example: '#1976d2',
    description: 'Main brand color — primary CTAs, active states',
  })
  @IsString()
  brandColor: string;

  @ApiProperty({
    required: true,
    example: '#ff9800',
    description: 'Secondary brand accent',
  })
  @IsString()
  secondaryColor: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoIcon?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoBanner?: string | null;
}
