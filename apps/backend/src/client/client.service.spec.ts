import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { ClientRepository } from './client.repository';
import {
  TENANT_A,
  TENANT_B,
  mockTenantScope,
  mockSuperadminScope,
} from '../common/testing/tenant-test.helpers';
import type { CreateClientDto } from './dto/create-client.dto';

const CLIENT_ID = 'client-1';

const baseClient = {
  id_client: CLIENT_ID,
  firstName: 'John',
  lastName: 'Doe',
  id_tenant: TENANT_A,
};

describe('ClientService – tenant scoping', () => {
  let service: ClientService;
  let mockRepo: jest.Mocked<ClientRepository>;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      existsById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as unknown as jest.Mocked<ClientRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: ClientRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return client when tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(baseClient as any);

      const result = await service.findOne(CLIENT_ID, mockTenantScope(TENANT_A));
      expect(result).toEqual(baseClient);
    });

    it('should throw NotFoundException for cross-tenant access', async () => {
      mockRepo.findById.mockResolvedValue(baseClient as any);

      await expect(
        service.findOne(CLIENT_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to bypass tenant check', async () => {
      mockRepo.findById.mockResolvedValue(baseClient as any);

      const result = await service.findOne(CLIENT_ID, mockSuperadminScope());
      expect(result).toEqual(baseClient);
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update when tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(baseClient as any);
      mockRepo.update.mockResolvedValue({ ...baseClient, firstName: 'Jane' } as any);

      const result = await service.update(CLIENT_ID, { firstName: 'Jane' }, mockTenantScope(TENANT_A));
      expect(result.firstName).toBe('Jane');
    });

    it('should throw NotFoundException for cross-tenant update', async () => {
      mockRepo.findById.mockResolvedValue(baseClient as any);

      await expect(
        service.update(CLIENT_ID, { firstName: 'Hacker' }, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to update any client', async () => {
      mockRepo.findById.mockResolvedValue(baseClient as any);
      mockRepo.update.mockResolvedValue({ ...baseClient, firstName: 'Admin' } as any);

      const result = await service.update(CLIENT_ID, { firstName: 'Admin' }, mockSuperadminScope());
      expect(result.firstName).toBe('Admin');
    });
  });

  // ---------------------------------------------------------------------------
  // remove
  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should remove when tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(baseClient as any);
      mockRepo.softDelete.mockResolvedValue({ ...baseClient, isDeleted: true } as any);

      await expect(service.remove(CLIENT_ID, mockTenantScope(TENANT_A))).resolves.not.toThrow();
    });

    it('should throw NotFoundException for cross-tenant remove', async () => {
      mockRepo.findById.mockResolvedValue(baseClient as any);

      await expect(
        service.remove(CLIENT_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to remove any client', async () => {
      mockRepo.findById.mockResolvedValue(baseClient as any);
      mockRepo.softDelete.mockResolvedValue({ ...baseClient, isDeleted: true } as any);

      await expect(service.remove(CLIENT_ID, mockSuperadminScope())).resolves.not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // create (with scope)
  // ---------------------------------------------------------------------------
  describe('create with scope', () => {
    const dto: CreateClientDto = {
      firstName: 'New',
      lastName: 'Client',
      id_tenant: TENANT_A,
    };

    it('should auto-set id_tenant from TENANT scope', async () => {
      mockRepo.create.mockImplementation(async (data) => ({ ...data, id_client: 'new-1' } as any));

      await service.create({ ...dto, id_tenant: TENANT_B }, mockTenantScope(TENANT_A));

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_tenant: TENANT_A }),
      );
    });

    it('should use body id_tenant for SUPERADMIN', async () => {
      mockRepo.create.mockImplementation(async (data) => ({ ...data, id_client: 'new-2' } as any));

      await service.create(dto, mockSuperadminScope());

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_tenant: TENANT_A }),
      );
    });

    it('should throw BadRequestException when SUPERADMIN provides no id_tenant', async () => {
      await expect(
        service.create({ firstName: 'X' }, mockSuperadminScope()),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  // create (without scope – internal call path)
  // ---------------------------------------------------------------------------
  describe('create without scope', () => {
    it('should pass through without tenant enforcement', async () => {
      const dto: CreateClientDto = { firstName: 'Internal', id_tenant: TENANT_A };
      mockRepo.create.mockImplementation(async (data) => ({ ...data, id_client: 'int-1' } as any));

      await expect(service.create(dto)).resolves.not.toThrow();

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Internal', id_tenant: TENANT_A }),
      );
    });
  });
});
