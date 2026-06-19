import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTenantThemeDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @IsOptional()
  @IsHexColor()
  brandColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  logoIcon?: string | null;

  @IsOptional()
  @IsString()
  logoBanner?: string | null;
}
