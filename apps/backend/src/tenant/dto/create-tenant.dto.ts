import { IsOptional, IsUrl, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTenantDto as SharedCreateTenantDto } from '@RealEstate/types'

export class CreateTenantDto implements SharedCreateTenantDto {
  @ApiProperty({ required: true, example: 'Acme Corp' })
  @IsString()
  name: string;

  @ApiProperty({ required: true, example: 'https://acme.example.com' })
  @IsOptional()
  @IsUrl()
  customDomain?: string;

  @ApiProperty({ required: true, example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID()
  id_plan?: string | null
}
