import { Test, TestingModule } from '@nestjs/testing';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationRepository } from './reservation.repository';

describe('ReservationRepository', () => {
  let repository: ReservationRepository;
  let mockPrisma: { reservation: { count: jest.Mock } };

  beforeEach(async () => {
    mockPrisma = {
      reservation: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<ReservationRepository>(ReservationRepository);
  });

  describe('checkOverlap', () => {
    const id_property = 'prop-1';
    const startDate = new Date('2025-06-01');
    const endDate = new Date('2025-06-10');

    it('returns true when an overlapping UPCOMING or ACTIVE reservation exists', async () => {
      mockPrisma.reservation.count.mockResolvedValue(1);

      const result = await repository.checkOverlap(id_property, startDate, endDate);

      expect(result).toBe(true);
      expect(mockPrisma.reservation.count).toHaveBeenCalledWith({
        where: {
          id_property,
          status: { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });
    });

    it('returns false when no overlapping reservations exist', async () => {
      mockPrisma.reservation.count.mockResolvedValue(0);

      const result = await repository.checkOverlap(id_property, startDate, endDate);

      expect(result).toBe(false);
    });

    it('excludes the given reservation id when excludeId is provided', async () => {
      const excludeId = 'res-99';
      mockPrisma.reservation.count.mockResolvedValue(0);

      const result = await repository.checkOverlap(id_property, startDate, endDate, excludeId);

      expect(result).toBe(false);
      expect(mockPrisma.reservation.count).toHaveBeenCalledWith({
        where: {
          id_property,
          id_reservation: { not: excludeId },
          status: { in: [ReservationStatus.UPCOMING, ReservationStatus.ACTIVE] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });
    });

    it('does not include id_reservation filter when excludeId is not provided', async () => {
      mockPrisma.reservation.count.mockResolvedValue(0);

      await repository.checkOverlap(id_property, startDate, endDate);

      const calledWith = mockPrisma.reservation.count.mock.calls[0][0];
      expect(calledWith.where).not.toHaveProperty('id_reservation');
    });
  });
});
