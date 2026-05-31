import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { ReservationRepository } from './reservation.repository';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ForwardReservationStatus } from './dto/update-reservation-status.dto';
import { type TenantScope, assertTenantMatch } from '../common/types/tenant-scope';

const VALID_TRANSITIONS: Partial<Record<ReservationStatus, ForwardReservationStatus>> = {
  [ReservationStatus.UPCOMING]: ForwardReservationStatus.ACTIVE,
  [ReservationStatus.ACTIVE]: ForwardReservationStatus.COMPLETED,
};

@Injectable()
export class ReservationService {
  constructor(private readonly reservationRepository: ReservationRepository) { }

  async create(id_property: string, dto: CreateReservationDto) {
    const propertyExists = await this.reservationRepository.propertyExists(id_property);
    if (!propertyExists)
      throw new NotFoundException(`Property with id '${id_property}' not found`);

    const startDate = dto.startDate;
    const endDate = dto.endDate;

    if (endDate <= startDate)
      throw new BadRequestException('endDate must be after startDate');

    const hasOverlap = await this.reservationRepository.checkOverlap(
      id_property,
      startDate,
      endDate,
    );
    if (hasOverlap)
      throw new ConflictException(
        'The property already has an active or upcoming reservation that overlaps these dates',
      );

    return this.reservationRepository.create({
      id_property,
      guestName: dto.guestName,
      numberOfGuests: dto.numberOfGuests,
      startDate,
      endDate,
      totalCost: dto.totalCost,
      platform: dto.platform
    });
  }

  async findOne(id_reservation: string, scope?: TenantScope) {
    const reservation = await this.reservationRepository.findByIdWithTenant(id_reservation);
    if (!reservation)
      throw new NotFoundException(`Reservation with id '${id_reservation}' not found`);

    if (scope) assertTenantMatch(scope, reservation.property.id_tenant);

    // Strip internal property relation before returning
    const { property: _property, ...result } = reservation;
    return result;
  }

  async update(id_reservation: string, dto: UpdateReservationDto, scope?: TenantScope) {
    const existing = await this.reservationRepository.findByIdWithTenant(id_reservation);
    if (!existing)
      throw new NotFoundException(`Reservation with id '${id_reservation}' not found`);

    if (scope) assertTenantMatch(scope, existing.property.id_tenant);

    if (existing.status === ReservationStatus.CANCELLED || existing.status === ReservationStatus.COMPLETED)
      throw new BadRequestException(
        `Cannot update a reservation with status '${existing.status}'`,
      );

    // Re-check overlap if dates are being changed
    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;

    if (endDate <= startDate)
      throw new BadRequestException('endDate must be after startDate');

    if (dto.startDate || dto.endDate) {
      const hasOverlap = await this.reservationRepository.checkOverlap(
        existing.id_property,
        startDate,
        endDate,
        id_reservation,
      );
      if (hasOverlap)
        throw new ConflictException(
          'The updated dates overlap with an existing active or upcoming reservation',
        );
    }

    return this.reservationRepository.update(id_reservation, dto);
  }

  async updateStatus(id_reservation: string, newStatus: ForwardReservationStatus, scope?: TenantScope) {
    const existing = await this.reservationRepository.findByIdWithTenant(id_reservation);
    if (!existing)
      throw new NotFoundException(`Reservation with id '${id_reservation}' not found`);

    if (scope) assertTenantMatch(scope, existing.property.id_tenant);

    const allowedNext = VALID_TRANSITIONS[existing.status];
    if (allowedNext !== newStatus)
      throw new BadRequestException(
        `Cannot transition from '${existing.status}' to '${newStatus}'. ` +
        `Allowed: ${allowedNext ? `'${existing.status}' → '${allowedNext}'` : 'none'}`,
      );

    return this.reservationRepository.updateStatus(
      id_reservation,
      newStatus as ReservationStatus,
    );
  }

  async cancel(id_reservation: string, scope?: TenantScope) {
    const existing = await this.reservationRepository.findByIdWithTenant(id_reservation);
    if (!existing)
      throw new NotFoundException(`Reservation with id '${id_reservation}' not found`);

    if (scope) assertTenantMatch(scope, existing.property.id_tenant);

    if (
      existing.status === ReservationStatus.CANCELLED ||
      existing.status === ReservationStatus.COMPLETED
    )
      throw new BadRequestException(
        `Cannot cancel a reservation with status '${existing.status}'`,
      );

    return this.reservationRepository.cancel(id_reservation);
  }

}
