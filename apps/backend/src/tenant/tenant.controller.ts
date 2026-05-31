import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRoles } from "@RealEstate/types";
import { GetTenantQueryParams } from './dto/get-tenant-query-params';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.SUPERADMIN)
@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) { }

  @Post()
  @ResponseMessage('Tenant created successfully')
  create(@Body() createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ResponseMessage('Tenants fetched successfully')
  findAll(): Promise<TenantResponseDto[]> {
    return this.tenantService.findAll();
  }

  @Get(':id_tenant')
  @ResponseMessage('Tenant fetched successfully')
  findOne(
    @Param('id_tenant') id_tenant: string,
    @Query(new ValidationPipe({ transform: true })) query: GetTenantQueryParams,
  ): Promise<TenantResponseDto> {
    const { includeUsers } = query
    return this.tenantService.findOne(id_tenant, includeUsers);
  }

  @Patch(':id_tenant')
  @ResponseMessage('Tenant updated successfully')
  update(@Param('id_tenant') id_tenant: string, @Body() updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto> {
    return this.tenantService.update(id_tenant, updateTenantDto);
  }

  @Patch(':id_tenant/theme')
  @ResponseMessage('Tenant theme updated successfully')
  updateTheme(
    @Param('id_tenant') id_tenant: string,
    @Body('id_theme') id_theme: string,
  ): Promise<TenantResponseDto> {
    return this.tenantService.updateTheme(id_tenant, id_theme);
  }

  @Delete(':id_tenant')
  @ResponseMessage('Tenant deleted successfully')
  remove(@Param('id_tenant') id_tenant: string): Promise<TenantResponseDto> {
    return this.tenantService.remove(id_tenant);
  }
}
