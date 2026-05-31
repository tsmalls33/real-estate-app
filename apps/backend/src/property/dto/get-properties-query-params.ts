import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyStatus, SaleType } from '@prisma/client';

export class GetPropertiesQueryParams {
  @ApiPropertyOptional({ enum: PropertyStatus })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiPropertyOptional({ enum: SaleType })
  @IsEnum(SaleType)
  @IsOptional()
  saleType?: SaleType;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  id_tenant?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  id_agent?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}
