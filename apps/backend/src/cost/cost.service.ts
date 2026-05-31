import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CostRepository } from './cost.repository';
import { CreateCostDto } from './dto/create-cost.dto';
import { GetCostsQueryParams } from './dto/get-costs-query-params';
import { UpdateCostDto } from './dto/update-cost.dto';
import { type TenantScope, assertTenantMatch } from '../common/types/tenant-scope';

@Injectable()
export class CostService {
  constructor(private readonly costRepository: CostRepository) { }

  async create(data: CreateCostDto, scope?: TenantScope) {
    let { id_property, id_reservation } = data;

    if (id_reservation) {
      const reservationProperty =
        await this.costRepository.findReservationProperty(id_reservation);

      if (reservationProperty === null) {
        throw new NotFoundException(
          `Reservation '${id_reservation}' not found`,
        );
      }

      if (id_property && id_property !== reservationProperty) {
        throw new BadRequestException(
          'id_property does not match the property of the given reservation',
        );
      }

      id_property = reservationProperty;
    }

    if (scope && id_property) {
      await this.verifyPropertyTenant(id_property, scope);
    }

    return this.costRepository.create({
      costType: data.costType,
      date: new Date(data.date),
      amount: data.amount,
      id_property,
      id_reservation,
    } as Prisma.CostUncheckedCreateInput);
  }

  async findAll(query: GetCostsQueryParams, scope: TenantScope) {
    return this.costRepository.findAll(query, scope);
  }

  async findOne(id_cost: string, scope?: TenantScope) {
    const cost = await this.costRepository.findById(id_cost);
    if (!cost) throw new NotFoundException(`Cost '${id_cost}' not found`);
    if (scope) {
      await this.assertCostTenant(cost, scope);
    }
    return cost;
  }

  async update(id_cost: string, dto: UpdateCostDto, scope?: TenantScope) {
    const existing = await this.costRepository.findById(id_cost);
    if (!existing) throw new NotFoundException(`Cost '${id_cost}' not found`);

    // Authorize against the cost's CURRENT tenant before any changes.
    if (scope) {
      await this.assertCostTenant(existing, scope);
    }

    const effectiveProperty = dto.id_property ?? existing.id_property;
    const effectiveReservation = dto.id_reservation ?? existing.id_reservation;

    if (!effectiveProperty && !effectiveReservation) {
      throw new BadRequestException(
        'Cost must retain at least one of id_property or id_reservation',
      );
    }

    if (effectiveReservation) {
      const reservationProperty =
        await this.costRepository.findReservationProperty(effectiveReservation);

      if (reservationProperty === null) {
        throw new NotFoundException(
          `Reservation '${effectiveReservation}' not found`,
        );
      }

      if (effectiveProperty && effectiveProperty !== reservationProperty) {
        throw new BadRequestException(
          'id_property does not match the property of the given reservation',
        );
      }
    }

    // If the update moves the cost to a different property, the NEW property
    // must also be in-scope. Prevents a tenant-scoped caller from relocating
    // their own cost onto another tenant's property.
    if (
      scope &&
      dto.id_property &&
      dto.id_property !== existing.id_property
    ) {
      await this.verifyPropertyTenant(dto.id_property, scope);
    }

    const updateData: Prisma.CostUncheckedUpdateInput = {
      ...dto,
      ...(dto.date && { date: new Date(dto.date) }),
    };

    return this.costRepository.update(id_cost, updateData);
  }

  async remove(id_cost: string, scope?: TenantScope) {
    const existing = await this.costRepository.findById(id_cost);
    if (!existing) throw new NotFoundException(`Cost '${id_cost}' not found`);

    if (scope) {
      await this.assertCostTenant(existing, scope);
    }

    return this.costRepository.softDelete(id_cost);
  }

  /**
   * Resolve the property a cost belongs to (directly or via its reservation),
   * then assert the scope has access to that property's tenant.
   *
   * A cost with neither id_property nor id_reservation is untenanted and is
   * only reachable by SUPERADMIN.
   */
  private async assertCostTenant(
    cost: { id_property: string | null; id_reservation: string | null },
    scope: TenantScope,
  ): Promise<void> {
    if (scope.type === 'ALL') return;

    let id_property = cost.id_property;
    if (!id_property && cost.id_reservation) {
      id_property = await this.costRepository.findReservationProperty(
        cost.id_reservation,
      );
    }

    if (!id_property) {
      // Nothing to scope against — treat as not found for this tenant.
      throw new NotFoundException('Record not found in your organization');
    }

    await this.verifyPropertyTenant(id_property, scope);
  }

  private async verifyPropertyTenant(id_property: string, scope: TenantScope) {
    const propertyTenant = await this.costRepository.findPropertyTenant(id_property);
    assertTenantMatch(scope, propertyTenant);
  }
}
