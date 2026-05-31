import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CostType,
  GetCostsQueryParams as SharedGetCostsQueryParams,
} from '@RealEstate/types';

export class GetCostsQueryParams implements SharedGetCostsQueryParams {
  @ApiProperty({ required: false, enum: CostType })
  @IsOptional()
  @IsEnum(CostType)
  costType?: CostType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id_property?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id_reservation?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
