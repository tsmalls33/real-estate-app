import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PlanPeriod, CreatePlanDto as SharedCreatePlanDto } from '@RealEstate/types';

export class CreatePlanDto implements SharedCreatePlanDto {
  @ApiProperty({ required: true, example: 'Premium' })
  @IsString()
  name: string;

  @ApiProperty({ required: true, example: 49.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiProperty({ required: true, enum: PlanPeriod, example: PlanPeriod.MONTHLY })
  @IsEnum(PlanPeriod)
  pricePeriod: PlanPeriod;

  @ApiProperty({ required: false, example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
