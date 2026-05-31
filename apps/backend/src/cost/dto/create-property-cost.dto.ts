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
  CreatePropertyCostDto as SharedCreatePropertyCostDto,
} from '@RealEstate/types';

export class CreatePropertyCostDto implements SharedCreatePropertyCostDto {
  @ApiProperty({ enum: CostType })
  @IsEnum(CostType)
  costType: CostType;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id_reservation?: string;
}
