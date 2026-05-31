import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRoles } from '@RealEstate/types';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import type { TenantScope } from '../common/types/tenant-scope';
import { CostService } from './cost.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { GetCostsQueryParams } from './dto/get-costs-query-params';

@ApiTags('Cost')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.EMPLOYEE)
@Controller('costs')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true })) query: GetCostsQueryParams,
    @CurrentTenant() scope: TenantScope,
  ) {
    return this.costService.findAll(query, scope);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() scope: TenantScope) {
    return this.costService.findOne(id, scope);
  }

  @Post()
  create(@Body() dto: CreateCostDto, @CurrentTenant() scope: TenantScope) {
    return this.costService.create(dto, scope);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCostDto, @CurrentTenant() scope: TenantScope) {
    return this.costService.update(id, dto, scope);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() scope: TenantScope) {
    return this.costService.remove(id, scope);
  }
}
