import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CostService } from './cost.service';
import { CostRepository } from './cost.repository';
import {
  TENANT_A,
  TENANT_B,
  mockTenantScope,
  mockSuperadminScope,
} from '../common/testing/tenant-test.helpers';

const COST_ID = 'cost-1';
const PROPERTY_ID = 'prop-1';

const baseCost = {
  id_cost: COST_ID,
  costType: 'MAINTENANCE',
  date: new Date('2026-01-15'),
  amount: 150,
  id_property: PROPERTY_ID,
  id_reservation: null,
};

describe('CostService – tenant scoping', () => {
  let service: CostService;
  let mockRepo: jest.Mocked<CostRepository>;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      existsById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findReservationProperty: jest.fn(),
      findPropertyTenant: jest.fn(),
    } as unknown as jest.Mocked<CostRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostService,
        { provide: CostRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CostService>(CostService);
  });

  // ---------------------------------------------------------------------------
  // findAll
  // ---------------------------------------------------------------------------
  describe('findAll', () => {
    it('should pass scope to repository', async () => {
      const scope = mockTenantScope(TENANT_A);
      mockRepo.findAll.mockResolvedValue({ data: [], total: 0 });

      await service.findAll({} as any, scope);

      expect(mockRepo.findAll).toHaveBeenCalledWith(expect.anything(), scope);
    });
  });

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return cost when property tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(baseCost as any);
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);

      const result = await service.findOne(COST_ID, mockTenantScope(TENANT_A));
      expect(result).toEqual(baseCost);
    });

    it('should throw NotFoundException for cross-tenant access', async () => {
      mockRepo.findById.mockResolvedValue(baseCost as any);
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);

      await expect(
        service.findOne(COST_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to bypass tenant check', async () => {
      mockRepo.findById.mockResolvedValue(baseCost as any);
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);

      const result = await service.findOne(COST_ID, mockSuperadminScope());
      expect(result).toEqual(baseCost);
    });
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    const dto = { costType: 'MAINTENANCE' as any, date: '2026-01-15', amount: 100, id_property: PROPERTY_ID };

    it('should verify property tenant and allow matching tenant', async () => {
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);
      mockRepo.create.mockResolvedValue(baseCost as any);

      await expect(
        service.create(dto, mockTenantScope(TENANT_A)),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException for cross-tenant create', async () => {
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);

      await expect(
        service.create(dto, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to create for any property', async () => {
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);
      mockRepo.create.mockResolvedValue(baseCost as any);

      await expect(
        service.create(dto, mockSuperadminScope()),
      ).resolves.not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update when property tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(baseCost as any);
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);
      mockRepo.update.mockResolvedValue({ ...baseCost, amount: 200 } as any);

      const result = await service.update(COST_ID, { amount: 200 }, mockTenantScope(TENANT_A));
      expect(result.amount).toBe(200);
    });

    it('should throw NotFoundException for cross-tenant update', async () => {
      mockRepo.findById.mockResolvedValue(baseCost as any);
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);

      await expect(
        service.update(COST_ID, { amount: 200 }, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to update any cost', async () => {
      mockRepo.findById.mockResolvedValue(baseCost as any);
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);
      mockRepo.update.mockResolvedValue({ ...baseCost, amount: 200 } as any);

      const result = await service.update(COST_ID, { amount: 200 }, mockSuperadminScope());
      expect(result.amount).toBe(200);
    });
  });

  // ---------------------------------------------------------------------------
  // remove
  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should remove when property tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(baseCost as any);
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);
      mockRepo.softDelete.mockResolvedValue({ ...baseCost, isDeleted: true } as any);

      await expect(service.remove(COST_ID, mockTenantScope(TENANT_A))).resolves.not.toThrow();
    });

    it('should throw NotFoundException for cross-tenant remove', async () => {
      mockRepo.findById.mockResolvedValue(baseCost as any);
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);

      await expect(
        service.remove(COST_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to remove any cost', async () => {
      mockRepo.findById.mockResolvedValue(baseCost as any);
      mockRepo.findPropertyTenant.mockResolvedValue(TENANT_A);
      mockRepo.softDelete.mockResolvedValue({ ...baseCost, isDeleted: true } as any);

      await expect(service.remove(COST_ID, mockSuperadminScope())).resolves.not.toThrow();
    });
  });
});
