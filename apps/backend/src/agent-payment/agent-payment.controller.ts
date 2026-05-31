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
import { AgentPaymentService } from './agent-payment.service';
import { CreateAgentPaymentDto } from './dto/create-agent-payment.dto';
import { UpdateAgentPaymentDto } from './dto/update-agent-payment.dto';
import { GetAgentPaymentsQueryParams } from './dto/get-agent-payments-query-params';

@ApiTags('AgentPayment')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.EMPLOYEE)
@Controller('agent-payments')
export class AgentPaymentController {
  constructor(private readonly agentPaymentService: AgentPaymentService) {}

  @Get()
  findAll(@Query() query: GetAgentPaymentsQueryParams, @CurrentTenant() scope: TenantScope) {
    return this.agentPaymentService.findAll(query, scope);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() scope: TenantScope) {
    return this.agentPaymentService.findOne(id, scope);
  }

  @Post()
  create(@Body() dto: CreateAgentPaymentDto, @CurrentTenant() scope: TenantScope) {
    return this.agentPaymentService.create(dto, scope);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgentPaymentDto, @CurrentTenant() scope: TenantScope) {
    return this.agentPaymentService.update(id, dto, scope);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() scope: TenantScope) {
    return this.agentPaymentService.remove(id, scope);
  }
}
