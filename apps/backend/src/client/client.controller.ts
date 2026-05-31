import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRoles } from '@RealEstate/types';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import type { TenantScope } from '../common/types/tenant-scope';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { GetClientsQueryParams } from './dto/get-clients-query-params';

@ApiTags('Client')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.EMPLOYEE)
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  findAll(@Query() query: GetClientsQueryParams, @CurrentTenant() scope: TenantScope) {
    return this.clientService.findAll(query, scope);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() scope: TenantScope) {
    return this.clientService.findOne(id, scope);
  }

  @Post()
  create(@Body() dto: CreateClientDto, @CurrentTenant() scope: TenantScope) {
    return this.clientService.create(dto, scope);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto, @CurrentTenant() scope: TenantScope) {
    return this.clientService.update(id, dto, scope);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() scope: TenantScope) {
    return this.clientService.remove(id, scope);
  }
}
