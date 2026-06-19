import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Query,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantThemeDto } from './dto/update-tenant-theme.dto';
import { AssignTenantThemeDto } from './dto/assign-tenant-theme.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRoles } from '@RealEstate/types';
import { GetTenantQueryParams } from './dto/get-tenant-query-params';
import { TenantResponseDto } from './dto/tenant-response.dto';
import type { JwtPayload } from '../common/types/jwt-payload.interface';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.SUPERADMIN)
@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

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
    const { includeUsers } = query;
    return this.tenantService.findOne(id_tenant, includeUsers);
  }

  @Patch(':id_tenant')
  @ResponseMessage('Tenant updated successfully')
  update(
    @Param('id_tenant') id_tenant: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.tenantService.update(id_tenant, updateTenantDto);
  }

  /** PATCH — edit the tenant's own theme fields (colors, name, logos). */
  @Patch(':id_tenant/theme')
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @ResponseMessage('Tenant theme updated successfully')
  updateTheme(
    @Param('id_tenant') id_tenant: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    input: UpdateTenantThemeDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TenantResponseDto> {
    this.assertCanEditTenant(user, id_tenant);
    return this.tenantService.updateAssignedTheme(id_tenant, input);
  }

  /** PUT — reassign the tenant to a different, existing theme. */
  @Put(':id_tenant/theme')
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @ResponseMessage('Tenant theme assigned successfully')
  assignTheme(
    @Param('id_tenant') id_tenant: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    input: AssignTenantThemeDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TenantResponseDto> {
    this.assertCanEditTenant(user, id_tenant);
    return this.tenantService.assignTheme(id_tenant, input.id_theme);
  }

  private assertCanEditTenant(user: JwtPayload, id_tenant: string): void {
    if (user.role === UserRoles.ADMIN && user.tenantId !== id_tenant) {
      throw new ForbiddenException('Admins may only edit their own tenant');
    }
  }

  @Delete(':id_tenant')
  @ResponseMessage('Tenant deleted successfully')
  remove(@Param('id_tenant') id_tenant: string): Promise<TenantResponseDto> {
    return this.tenantService.remove(id_tenant);
  }
}
