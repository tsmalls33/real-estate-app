import { Injectable } from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RESERVATION_SELECT } from './projections/reservation.projection';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Prisma.ReservationUncheckedCreateInput) {
    return this.prisma.reservation.create({ data, select: RESERVATION_SELECT });
  }

  async findById(id_reservation: string) {
    return this.prisma.reservation.findUnique({
      where: { id_reservation },
      select: RESERVATION_SELECT,
    });
  }

  async findByIdWithTenant(id_reservation: string) {
    return this.prisma.reservation.findUnique({
      where: { id_reservation },
      select: {
        ...RESERVATION_SELECT,
        property: { select: { id_tenant: true } },
      },
    });
  }

  async existsById(id_reservation: string): Promise<boolean> {
    const r = await this.prisma.reservation.findUnique({
      where: { id_reservation },
      select: { id_reservation: true },
    });
    return r !== null;
  }

  async update(id_reservation: string, data: UpdateReservationDto) {
    return this.prisma.reservation.update({
      where: { id_reservation },
      data,
      select: RESERVATION_SELECT,
    });
  }

  /**
   * Returns true if any UPCOMING or ACTIVE reservation for the property
   * overlaps with [startDate, endDate). Excludes `excludeId` (used on update).
   */
  async checkOverlap(
    id_property: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.reservation.count({
      where: {
        id_property,
        ...(excludeId && { id_reservation: { not: excludeId } }),
        status: { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });
    return count > 0;
  }

  async updateStatus(id_reservation: string, status: ReservationStatus) {
    return this.prisma.reservation.update({
      where: { id_reservation },
      data: { status },
      select: RESERVATION_SELECT,
    });
  }

  async cancel(id_reservation: string) {
    return this.prisma.reservation.update({
      where: { id_reservation },
      data: { status: ReservationStatus.CANCELLED, dateCancelled: new Date() },
      select: RESERVATION_SELECT,
    });
  }

  /** Lightweight property existence check to avoid circular module dependency. */
  async propertyExists(id_property: string): Promise<boolean> {
    const p = await this.prisma.property.findFirst({
      where: { id_property, isDeleted: false },
      select: { id_property: true },
    });
    return p !== null;
  }
}
