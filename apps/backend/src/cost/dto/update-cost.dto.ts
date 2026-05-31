import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CostType,
  UpdateCostDto as SharedUpdateCostDto,
} from '@RealEstate/types';

export class UpdateCostDto implements SharedUpdateCostDto {
  @ApiProperty({ enum: CostType, required: false })
  @IsOptional()
  @IsEnum(CostType)
  costType?: CostType;

  @ApiProperty({ required: false, example: '2026-01-15' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false, example: 150.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id_property?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id_reservation?: string;
}
