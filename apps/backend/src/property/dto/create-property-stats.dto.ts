import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePropertyStatsDto as SharedCreatePropertyStatsDto, PropertyType } from '@RealEstate/types';

export class CreatePropertyStatsDto implements SharedCreatePropertyStatsDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Type(() => Number)
  numberOfBedrooms!: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  numberOfBathrooms!: number;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @ApiProperty({ required: false, example: 'Downtown' })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiProperty({ example: 75.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @IsOptional()
  sizeSquareMeters?: number;

  @ApiProperty({ example: 2005 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  yearBuilt?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  floorNumber?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  hasElevator?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  hasGarage?: boolean;
}
