import {
  Controller,
  ForbiddenException,
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
import { UpdateTenantThemeDto } from './dto/update-tenant-theme.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRoles } from '@RealEstate/types';
import { GetTenantQueryParams } from './dto/get-tenant-query-params';
import { TenantResponseDto } from './dto/tenant-response.dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
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

  @Patch(':id_tenant/theme')
  @Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN)
  @ResponseMessage('Tenant theme updated successfully')
  updateTheme(
    @Param('id_tenant') id_tenant: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    input: UpdateTenantThemeDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TenantResponseDto> {
    if (user.role === UserRoles.ADMIN && user.tenantId !== id_tenant) {
      throw new ForbiddenException('Admins may only edit their own tenant');
    }
    return this.tenantService.updateTheme(id_tenant, input);
  }

  @Delete(':id_tenant')
  @ResponseMessage('Tenant deleted successfully')
  remove(@Param('id_tenant') id_tenant: string): Promise<TenantResponseDto> {
    return this.tenantService.remove(id_tenant);
  }
}
