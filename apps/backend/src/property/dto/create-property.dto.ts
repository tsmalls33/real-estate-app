import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyStatus, RentalMode, SaleType } from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Casa Bonita' })
  @IsString()
  propertyName: string;

  @ApiProperty({ example: 'Carrer de la Diputació 123, Barcelona' })
  @IsString()
  propertyAddress: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  propertyDescription?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({ required: false, example: 0.05 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  agentFeePercentage?: number;

  @ApiProperty({ required: false, example: 250000.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  salePrice?: number;

  @ApiProperty({ required: false, enum: SaleType })
  @IsEnum(SaleType)
  @IsOptional()
  saleType?: SaleType;

  @ApiProperty({
    required: false,
    enum: RentalMode,
    description:
      'Required when saleType is RENT. SHORT_TERM = nightly (Airbnb/Booking), LONG_TERM = monthly tenancy, HYBRID = both.',
  })
  @ValidateIf((o: CreatePropertyDto) => o.saleType === SaleType.RENT)
  @IsEnum(RentalMode, {
    message: 'rentalMode is required when saleType is RENT',
  })
  @IsOptional()
  rentalMode?: RentalMode;

  @ApiProperty({
    required: false,
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE_RENTAL,
  })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id_owner?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id_agent?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id_tenant?: string;
}
