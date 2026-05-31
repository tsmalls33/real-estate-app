import { IsDateString, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CostType,
  CreateReservationCostDto as SharedCreateReservationCostDto,
} from '@RealEstate/types';

export class CreateReservationCostDto implements SharedCreateReservationCostDto {
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
}
