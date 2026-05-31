import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationStatus } from '@prisma/client';
import { CreateReservationDto, Platform } from './dto/create-reservation.dto';
import { ForwardReservationStatus } from './dto/update-reservation-status.dto';
import { ReservationRepository } from './reservation.repository';
import { ReservationService } from './reservation.service';
import {
  TENANT_A,
  TENANT_B,
  mockTenantScope,
  mockSuperadminScope,
} from '../common/testing/tenant-test.helpers';

const PROPERTY_ID = 'prop-1';
const RESERVATION_ID = 'res-1';

const baseReservation = {
  id_reservation: RESERVATION_ID,
  id_property: PROPERTY_ID,
  guestName: 'Alice',
  numberOfGuests: 2,
  startDate: new Date('2026-03-10'),
  endDate: new Date('2026-03-15'),
  totalCost: 500,
  platform: Platform.AIRBNB,
  status: ReservationStatus.UPCOMING,
  dateCancelled: null,
  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-01'),
};

/** baseReservation augmented with the property relation returned by findByIdWithTenant */
const reservationWithTenant = {
  ...baseReservation,
  property: { id_tenant: TENANT_A },
};

let mockRepo: {
  propertyExists: jest.Mock;
  checkOverlap: jest.Mock;
  create: jest.Mock;
  findById: jest.Mock;
  findByIdWithTenant: jest.Mock;
  existsById: jest.Mock;
  update: jest.Mock;
  updateStatus: jest.Mock;
  cancel: jest.Mock;
};

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(async () => {
    mockRepo = {
      propertyExists: jest.fn(),
      checkOverlap: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithTenant: jest.fn(),
      existsById: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: ReservationRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    const dto: CreateReservationDto = {
      guestName: 'Alice',
      numberOfGuests: 2,
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-03-15'),
      totalCost: 500,
      platform: Platform.AIRBNB,
    };

    it('should throw NotFoundException when the property does not exist', async () => {
      mockRepo.propertyExists.mockResolvedValue(false);

      await expect(service.create(PROPERTY_ID, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when endDate equals startDate', async () => {
      mockRepo.propertyExists.mockResolvedValue(true);

      await expect(
        service.create(PROPERTY_ID, { ...dto, startDate: new Date('2026-03-10'), endDate: new Date('2026-03-10') }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when endDate is before startDate', async () => {
      mockRepo.propertyExists.mockResolvedValue(true);

      await expect(
        service.create(PROPERTY_ID, { ...dto, startDate: new Date('2026-03-15'), endDate: new Date('2026-03-10') }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when dates overlap an existing reservation', async () => {
      mockRepo.propertyExists.mockResolvedValue(true);
      mockRepo.checkOverlap.mockResolvedValue(true);

      await expect(service.create(PROPERTY_ID, dto)).rejects.toThrow(ConflictException);
    });

    it('should NOT throw when a new reservation starts exactly when an existing one ends (back-to-back)', async () => {
      mockRepo.propertyExists.mockResolvedValue(true);
      mockRepo.checkOverlap.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue({ ...baseReservation, startDate: new Date('2026-03-15'), endDate: new Date('2026-03-20') });

      await expect(
        service.create(PROPERTY_ID, { ...dto, startDate: new Date('2026-03-15'), endDate: new Date('2026-03-20') }),
      ).resolves.not.toThrow();
    });

    it('should create and return the reservation on success', async () => {
      mockRepo.propertyExists.mockResolvedValue(true);
      mockRepo.checkOverlap.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue(baseReservation);

      const result = await service.create(PROPERTY_ID, dto);

      expect(result).toEqual(baseReservation);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should throw NotFoundException when the reservation does not exist', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue(null);

      await expect(service.findOne(RESERVATION_ID)).rejects.toThrow(NotFoundException);
    });

    it('should return the reservation when it exists', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);

      const result = await service.findOne(RESERVATION_ID);

      // findOne strips the property relation
      const { property: _p, ...expected } = reservationWithTenant;
      expect(result).toEqual(expected);
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should throw NotFoundException when the reservation does not exist', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue(null);

      await expect(service.update(RESERVATION_ID, { guestName: 'Bob' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when the reservation is CANCELLED', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({
        ...reservationWithTenant,
        status: ReservationStatus.CANCELLED,
      });

      await expect(service.update(RESERVATION_ID, { guestName: 'Bob' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when the reservation is COMPLETED', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({
        ...reservationWithTenant,
        status: ReservationStatus.COMPLETED,
      });

      await expect(service.update(RESERVATION_ID, { guestName: 'Bob' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when updated endDate equals updated startDate', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);

      await expect(
        service.update(RESERVATION_ID, { startDate: new Date('2026-04-01'), endDate: new Date('2026-04-01') }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when updated endDate is before updated startDate', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);

      await expect(
        service.update(RESERVATION_ID, { startDate: new Date('2026-04-05'), endDate: new Date('2026-04-01') }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when new dates overlap another reservation', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);
      mockRepo.checkOverlap.mockResolvedValue(true);

      await expect(
        service.update(RESERVATION_ID, { startDate: new Date('2026-04-01'), endDate: new Date('2026-04-10') }),
      ).rejects.toThrow(ConflictException);
    });

    it('should NOT throw when updated dates are back-to-back with another reservation', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);
      mockRepo.checkOverlap.mockResolvedValue(false);
      const updated = { ...baseReservation, startDate: new Date('2026-03-15'), endDate: new Date('2026-03-20') };
      mockRepo.update.mockResolvedValue(updated);

      await expect(
        service.update(RESERVATION_ID, { startDate: new Date('2026-03-15'), endDate: new Date('2026-03-20') }),
      ).resolves.not.toThrow();
    });

    it('should update and return the reservation on success', async () => {
      const updated = { ...baseReservation, guestName: 'Bob' };
      mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);
      mockRepo.update.mockResolvedValue(updated);

      const result = await service.update(RESERVATION_ID, { guestName: 'Bob' });

      expect(result).toEqual(updated);
      expect(mockRepo.update).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // updateStatus
  // ---------------------------------------------------------------------------
  describe('updateStatus', () => {
    it('should throw NotFoundException when the reservation does not exist', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue(null);

      await expect(
        service.updateStatus(RESERVATION_ID, ForwardReservationStatus.ACTIVE),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow UPCOMING -> ACTIVE transition', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.UPCOMING });
      mockRepo.updateStatus.mockResolvedValue({ ...baseReservation, status: ReservationStatus.ACTIVE });

      const result = await service.updateStatus(RESERVATION_ID, ForwardReservationStatus.ACTIVE);

      expect(result.status).toBe(ReservationStatus.ACTIVE);
    });

    it('should allow ACTIVE -> COMPLETED transition', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.ACTIVE });
      mockRepo.updateStatus.mockResolvedValue({ ...baseReservation, status: ReservationStatus.COMPLETED });

      const result = await service.updateStatus(RESERVATION_ID, ForwardReservationStatus.COMPLETED);

      expect(result.status).toBe(ReservationStatus.COMPLETED);
    });

    it('should throw BadRequestException for UPCOMING -> COMPLETED (skipping ACTIVE)', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.UPCOMING });

      await expect(
        service.updateStatus(RESERVATION_ID, ForwardReservationStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for ACTIVE -> ACTIVE (no-op forward)', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.ACTIVE });

      await expect(
        service.updateStatus(RESERVATION_ID, ForwardReservationStatus.ACTIVE),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when transitioning from COMPLETED', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.COMPLETED });

      await expect(
        service.updateStatus(RESERVATION_ID, ForwardReservationStatus.ACTIVE),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when transitioning from CANCELLED', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.CANCELLED });

      await expect(
        service.updateStatus(RESERVATION_ID, ForwardReservationStatus.ACTIVE),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  // cancel
  // ---------------------------------------------------------------------------
  describe('cancel', () => {
    it('should throw NotFoundException when the reservation does not exist', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue(null);

      await expect(service.cancel(RESERVATION_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when the reservation is already CANCELLED', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({
        ...reservationWithTenant,
        status: ReservationStatus.CANCELLED,
      });

      await expect(service.cancel(RESERVATION_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the reservation is COMPLETED', async () => {
      mockRepo.findByIdWithTenant.mockResolvedValue({
        ...reservationWithTenant,
        status: ReservationStatus.COMPLETED,
      });

      await expect(service.cancel(RESERVATION_ID)).rejects.toThrow(BadRequestException);
    });

    it('should cancel an UPCOMING reservation', async () => {
      const cancelled = {
        ...baseReservation,
        status: ReservationStatus.CANCELLED,
        dateCancelled: new Date(),
      };
      mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.UPCOMING });
      mockRepo.cancel.mockResolvedValue(cancelled);

      const result = await service.cancel(RESERVATION_ID);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(mockRepo.cancel).toHaveBeenCalledWith(RESERVATION_ID);
    });

    it('should cancel an ACTIVE reservation', async () => {
      const cancelled = {
        ...baseReservation,
        status: ReservationStatus.CANCELLED,
        dateCancelled: new Date(),
      };
      mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.ACTIVE });
      mockRepo.cancel.mockResolvedValue(cancelled);

      const result = await service.cancel(RESERVATION_ID);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });
  });

  // ---------------------------------------------------------------------------
  // tenant scoping
  // ---------------------------------------------------------------------------
  describe('tenant scoping', () => {
    // findOne
    describe('findOne', () => {
      it('should return reservation when tenant matches', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);

        const result = await service.findOne(RESERVATION_ID, mockTenantScope(TENANT_A));
        const { property: _p, ...expected } = reservationWithTenant;
        expect(result).toEqual(expected);
      });

      it('should throw NotFoundException for cross-tenant access', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);

        await expect(
          service.findOne(RESERVATION_ID, mockTenantScope(TENANT_B)),
        ).rejects.toThrow(NotFoundException);
      });

      it('should allow SUPERADMIN to bypass tenant check', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);

        const result = await service.findOne(RESERVATION_ID, mockSuperadminScope());
        const { property: _p, ...expected } = reservationWithTenant;
        expect(result).toEqual(expected);
      });
    });

    // update
    describe('update', () => {
      it('should update when tenant matches', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);
        mockRepo.update.mockResolvedValue({ ...baseReservation, guestName: 'Bob' });

        const result = await service.update(RESERVATION_ID, { guestName: 'Bob' }, mockTenantScope(TENANT_A));
        expect(result.guestName).toBe('Bob');
      });

      it('should throw NotFoundException for cross-tenant update', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);

        await expect(
          service.update(RESERVATION_ID, { guestName: 'Bob' }, mockTenantScope(TENANT_B)),
        ).rejects.toThrow(NotFoundException);
      });

      it('should allow SUPERADMIN to update any reservation', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue(reservationWithTenant);
        mockRepo.update.mockResolvedValue({ ...baseReservation, guestName: 'Admin' });

        const result = await service.update(RESERVATION_ID, { guestName: 'Admin' }, mockSuperadminScope());
        expect(result.guestName).toBe('Admin');
      });
    });

    // updateStatus
    describe('updateStatus', () => {
      it('should update status when tenant matches', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.UPCOMING });
        mockRepo.updateStatus.mockResolvedValue({ ...baseReservation, status: ReservationStatus.ACTIVE });

        const result = await service.updateStatus(RESERVATION_ID, ForwardReservationStatus.ACTIVE, mockTenantScope(TENANT_A));
        expect(result.status).toBe(ReservationStatus.ACTIVE);
      });

      it('should throw NotFoundException for cross-tenant status update', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.UPCOMING });

        await expect(
          service.updateStatus(RESERVATION_ID, ForwardReservationStatus.ACTIVE, mockTenantScope(TENANT_B)),
        ).rejects.toThrow(NotFoundException);
      });

      it('should allow SUPERADMIN to update status on any reservation', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.UPCOMING });
        mockRepo.updateStatus.mockResolvedValue({ ...baseReservation, status: ReservationStatus.ACTIVE });

        const result = await service.updateStatus(RESERVATION_ID, ForwardReservationStatus.ACTIVE, mockSuperadminScope());
        expect(result.status).toBe(ReservationStatus.ACTIVE);
      });
    });

    // cancel
    describe('cancel', () => {
      it('should cancel when tenant matches', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.UPCOMING });
        mockRepo.cancel.mockResolvedValue({ ...baseReservation, status: ReservationStatus.CANCELLED, dateCancelled: new Date() });

        const result = await service.cancel(RESERVATION_ID, mockTenantScope(TENANT_A));
        expect(result.status).toBe(ReservationStatus.CANCELLED);
      });

      it('should throw NotFoundException for cross-tenant cancel', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.UPCOMING });

        await expect(
          service.cancel(RESERVATION_ID, mockTenantScope(TENANT_B)),
        ).rejects.toThrow(NotFoundException);
      });

      it('should allow SUPERADMIN to cancel any reservation', async () => {
        mockRepo.findByIdWithTenant.mockResolvedValue({ ...reservationWithTenant, status: ReservationStatus.UPCOMING });
        mockRepo.cancel.mockResolvedValue({ ...baseReservation, status: ReservationStatus.CANCELLED, dateCancelled: new Date() });

        const result = await service.cancel(RESERVATION_ID, mockSuperadminScope());
        expect(result.status).toBe(ReservationStatus.CANCELLED);
      });
    });
  });
});
