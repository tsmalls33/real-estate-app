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
  CreateCostDto as SharedCreateCostDto,
} from '@RealEstate/types';
import { AtLeastOneOf } from 'src/utils/validators/at-least-one.validator';

export class CreateCostDto implements SharedCreateCostDto {
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
  @AtLeastOneOf(['id_property', 'id_reservation'])
  @IsOptional()
  @IsUUID()
  id_property?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id_reservation?: string;
}
