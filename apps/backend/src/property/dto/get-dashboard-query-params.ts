import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetDashboardQueryParams {
  @ApiPropertyOptional({
    description: 'Scope the dashboard to a single property',
  })
  @IsUUID()
  @IsOptional()
  property?: string;
}
