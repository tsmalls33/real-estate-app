import { IsBoolean, IsDateString, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAgentPaymentDto as SharedCreateAgentPaymentDto } from '@RealEstate/types';

export class CreateAgentPaymentDto implements SharedCreateAgentPaymentDto {
  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiProperty()
  @IsUUID()
  id_user: string;
}
