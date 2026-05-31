import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentPaymentService } from './agent-payment.service';
import { AgentPaymentRepository } from './agent-payment.repository';
import {
  TENANT_A,
  TENANT_B,
  mockTenantScope,
  mockSuperadminScope,
} from '../common/testing/tenant-test.helpers';

const PAYMENT_ID = 'pay-1';

const basePayment = {
  id_agent_payment: PAYMENT_ID,
  dueDate: '2026-03-01',
  amount: 500,
  isPaid: false,
  id_user: 'user-1',
  id_tenant: TENANT_A,
};

describe('AgentPaymentService – tenant scoping', () => {
  let service: AgentPaymentService;
  let mockRepo: jest.Mocked<AgentPaymentRepository>;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      existsById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findUserTenant: jest.fn(),
    } as unknown as jest.Mocked<AgentPaymentRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentPaymentService,
        { provide: AgentPaymentRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AgentPaymentService>(AgentPaymentService);
  });

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return payment when tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(basePayment as any);

      const result = await service.findOne(PAYMENT_ID, mockTenantScope(TENANT_A));
      expect(result).toEqual(basePayment);
    });

    it('should throw NotFoundException for cross-tenant access', async () => {
      mockRepo.findById.mockResolvedValue(basePayment as any);

      await expect(
        service.findOne(PAYMENT_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to bypass tenant check', async () => {
      mockRepo.findById.mockResolvedValue(basePayment as any);

      const result = await service.findOne(PAYMENT_ID, mockSuperadminScope());
      expect(result).toEqual(basePayment);
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update when tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(basePayment as any);
      mockRepo.update.mockResolvedValue({ ...basePayment, isPaid: true } as any);

      const result = await service.update(PAYMENT_ID, { isPaid: true }, mockTenantScope(TENANT_A));
      expect(result.isPaid).toBe(true);
    });

    it('should throw NotFoundException for cross-tenant update', async () => {
      mockRepo.findById.mockResolvedValue(basePayment as any);

      await expect(
        service.update(PAYMENT_ID, { isPaid: true }, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to update any payment', async () => {
      mockRepo.findById.mockResolvedValue(basePayment as any);
      mockRepo.update.mockResolvedValue({ ...basePayment, isPaid: true } as any);

      const result = await service.update(PAYMENT_ID, { isPaid: true }, mockSuperadminScope());
      expect(result.isPaid).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // remove
  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should remove when tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(basePayment as any);
      mockRepo.softDelete.mockResolvedValue({ ...basePayment, isDeleted: true } as any);

      await expect(service.remove(PAYMENT_ID, mockTenantScope(TENANT_A))).resolves.not.toThrow();
    });

    it('should throw NotFoundException for cross-tenant remove', async () => {
      mockRepo.findById.mockResolvedValue(basePayment as any);

      await expect(
        service.remove(PAYMENT_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to remove any payment', async () => {
      mockRepo.findById.mockResolvedValue(basePayment as any);
      mockRepo.softDelete.mockResolvedValue({ ...basePayment, isDeleted: true } as any);

      await expect(service.remove(PAYMENT_ID, mockSuperadminScope())).resolves.not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    const dto = { dueDate: '2026-04-01', amount: 300, isPaid: false, id_user: 'user-1' };

    it('should inherit id_tenant from the target user when tenant matches', async () => {
      mockRepo.findUserTenant.mockResolvedValue(TENANT_A);
      mockRepo.create.mockImplementation(async (data) => ({ ...data, id_agent_payment: 'new-1' } as any));

      await service.create(dto as any, mockTenantScope(TENANT_A));

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_tenant: TENANT_A }),
      );
    });

    it('should throw NotFoundException when the target user does not exist', async () => {
      mockRepo.findUserTenant.mockResolvedValue(undefined);

      await expect(
        service.create(dto as any, mockTenantScope(TENANT_A)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when target user is in another tenant', async () => {
      mockRepo.findUserTenant.mockResolvedValue(TENANT_B);

      await expect(
        service.create(dto as any, mockTenantScope(TENANT_A)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for a user with no tenant', async () => {
      mockRepo.findUserTenant.mockResolvedValue(null);

      await expect(
        service.create(dto as any, mockSuperadminScope()),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow SUPERADMIN to create, inheriting the user tenant', async () => {
      mockRepo.findUserTenant.mockResolvedValue(TENANT_B);
      mockRepo.create.mockImplementation(async (data) => ({ ...data, id_agent_payment: 'new-2' } as any));

      await service.create(dto as any, mockSuperadminScope());

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_tenant: TENANT_B }),
      );
    });
  });
});
