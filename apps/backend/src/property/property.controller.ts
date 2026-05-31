import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import type { TenantScope } from '../common/types/tenant-scope';
import { UserRoles } from '@RealEstate/types';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { GetPropertiesQueryParams } from './dto/get-properties-query-params';
import { GetReservationsQueryParams } from './dto/get-reservations-query-params';
import { PropertyService } from './property.service';
import { PropertyStatsService } from './property-stats.service';
import { CreatePropertyStatsDto } from './dto/create-property-stats.dto';
import { CostService } from '../cost/cost.service';
import { CreatePropertyCostDto } from '../cost/dto/create-property-cost.dto';
import { UpdateCostDto } from '../cost/dto/update-cost.dto';
import { GetCostsQueryParams } from '../cost/dto/get-costs-query-params';
import { ReservationService } from '../reservation/reservation.service';
import { CreateReservationDto } from '../reservation/dto/create-reservation.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.EMPLOYEE)
@ApiTags('Property')
@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly reservationService: ReservationService,
    private readonly propertyStatsService: PropertyStatsService,
    private readonly costService: CostService,
  ) {}

  /** POST /properties */
  @Post()
  @ResponseMessage('Property created successfully')
  create(@Body() createPropertyDto: CreatePropertyDto, @CurrentTenant() scope: TenantScope) {
    return this.propertyService.create(createPropertyDto, scope);
  }

  /** GET /properties?status=&saleType=&id_tenant=&id_agent=&page=&limit= */
  @Get()
  @ResponseMessage('Properties fetched successfully')
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: GetPropertiesQueryParams,
    @CurrentTenant() scope: TenantScope,
  ) {
    return this.propertyService.findAll(query, scope);
  }

  /** GET /properties/:id_property */
  @Get(':id_property')
  @ResponseMessage('Property fetched successfully')
  findOne(
    @Param('id_property') id_property: string,
    @CurrentTenant() scope: TenantScope,
  ) {
    return this.propertyService.findOne(id_property, scope);
  }

  /** PATCH /properties/:id_property */
  @Patch(':id_property')
  @ResponseMessage('Property updated successfully')
  update(
    @Param('id_property') id_property: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @CurrentTenant() scope: TenantScope,
  ) {
    return this.propertyService.update(id_property, updatePropertyDto, scope);
  }

  /** DELETE /properties/:id_property */
  @Delete(':id_property')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Property deleted successfully')
  remove(
    @Param('id_property') id_property: string,
    @CurrentTenant() scope: TenantScope,
  ) {
    return this.propertyService.remove(id_property, scope);
  }

  /** POST /properties/:id_property/reservations */
  @Post(':id_property/reservations')
  @ResponseMessage('Reservation created successfully')
  async createReservation(
    @Param('id_property') id_property: string,
    @Body() dto: CreateReservationDto,
    @CurrentTenant() scope: TenantScope,
  ) {
    await this.propertyService.verifyTenantAccess(id_property, scope);
    return this.reservationService.create(id_property, dto);
  }

  /** PUT /properties/:id_property/stats */
  @Put(':id_property/stats')
  @ResponseMessage('Property stats saved successfully')
  async upsertStats(
    @Param('id_property') id_property: string,
    @Body() dto: CreatePropertyStatsDto,
    @CurrentTenant() scope: TenantScope,
  ) {
    await this.propertyService.verifyTenantAccess(id_property, scope);
    return this.propertyStatsService.upsert(id_property, dto);
  }

  /** GET /properties/:id_property/reservations */
  @Get(':id_property/reservations')
  @ResponseMessage('Reservations fetched successfully')
  async findReservations(
    @Param('id_property') id_property: string,
    @Query(new ValidationPipe({ transform: true }))
    query: GetReservationsQueryParams,
    @CurrentTenant() scope: TenantScope,
  ) {
    await this.propertyService.verifyTenantAccess(id_property, scope);
    return this.propertyService.findReservations(id_property, query);
  }

  /** GET /properties/:id_property/costs */
  @Get(':id_property/costs')
  @ResponseMessage('Costs fetched successfully')
  async findCosts(
    @Param('id_property') id_property: string,
    @Query(new ValidationPipe({ transform: true })) query: GetCostsQueryParams,
    @CurrentTenant() scope: TenantScope,
  ) {
    await this.propertyService.verifyTenantAccess(id_property, scope);
    return this.costService.findAll({ ...query, id_property }, scope);
  }

  /** POST /properties/:id_property/costs */
  @Post(':id_property/costs')
  @ResponseMessage('Cost created successfully')
  async createCost(
    @Param('id_property') id_property: string,
    @Body() dto: CreatePropertyCostDto,
    @CurrentTenant() scope: TenantScope,
  ) {
    await this.propertyService.verifyTenantAccess(id_property, scope);
    return this.costService.create({ ...dto, id_property });
  }

  /** PATCH /properties/:id_property/costs/:id_cost */
  @Patch(':id_property/costs/:id_cost')
  @ResponseMessage('Cost updated successfully')
  async updateCost(
    @Param('id_property') id_property: string,
    @Param('id_cost') id_cost: string,
    @Body() dto: UpdateCostDto,
    @CurrentTenant() scope: TenantScope,
  ) {
    await this.propertyService.verifyTenantAccess(id_property, scope);
    return this.costService.update(id_cost, dto);
  }

  /** DELETE /properties/:id_property/costs/:id_cost */
  @Delete(':id_property/costs/:id_cost')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cost deleted successfully')
  async deleteCost(
    @Param('id_property') id_property: string,
    @Param('id_cost') id_cost: string,
    @CurrentTenant() scope: TenantScope,
  ) {
    await this.propertyService.verifyTenantAccess(id_property, scope);
    return this.costService.remove(id_cost);
  }
}
