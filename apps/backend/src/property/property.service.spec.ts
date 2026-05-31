import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';
import { PropertyRepository } from './property.repository';
import {
  TENANT_A,
  TENANT_B,
  mockTenantScope,
  mockSuperadminScope,
} from '../common/testing/tenant-test.helpers';
import type { CreatePropertyDto } from './dto/create-property.dto';

const PROPERTY_ID = 'prop-1';

const baseProperty = {
  id_property: PROPERTY_ID,
  propertyName: 'Test Property',
  propertyAddress: '123 Main St',
  id_tenant: TENANT_A,
};

describe('PropertyService – tenant scoping', () => {
  let service: PropertyService;
  let mockRepo: jest.Mocked<PropertyRepository>;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      existsById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findReservations: jest.fn(),
    } as unknown as jest.Mocked<PropertyRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        { provide: PropertyRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
  });

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return property when tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);

      const result = await service.findOne(PROPERTY_ID, mockTenantScope(TENANT_A));
      expect(result).toEqual(baseProperty);
    });

    it('should throw NotFoundException for cross-tenant access', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);

      await expect(
        service.findOne(PROPERTY_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to bypass tenant check', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);

      const result = await service.findOne(PROPERTY_ID, mockSuperadminScope());
      expect(result).toEqual(baseProperty);
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update when tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);
      mockRepo.update.mockResolvedValue({ ...baseProperty, propertyName: 'Updated' } as any);

      const result = await service.update(PROPERTY_ID, { propertyName: 'Updated' }, mockTenantScope(TENANT_A));
      expect(result.propertyName).toBe('Updated');
    });

    it('should throw NotFoundException for cross-tenant update', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);

      await expect(
        service.update(PROPERTY_ID, { propertyName: 'Hacked' }, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to update any property', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);
      mockRepo.update.mockResolvedValue({ ...baseProperty, propertyName: 'Admin Updated' } as any);

      const result = await service.update(PROPERTY_ID, { propertyName: 'Admin Updated' }, mockSuperadminScope());
      expect(result.propertyName).toBe('Admin Updated');
    });
  });

  // ---------------------------------------------------------------------------
  // remove
  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should remove when tenant matches', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);
      mockRepo.softDelete.mockResolvedValue({ ...baseProperty, isDeleted: true } as any);

      await expect(service.remove(PROPERTY_ID, mockTenantScope(TENANT_A))).resolves.not.toThrow();
    });

    it('should throw NotFoundException for cross-tenant remove', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);

      await expect(
        service.remove(PROPERTY_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to remove any property', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);
      mockRepo.softDelete.mockResolvedValue({ ...baseProperty, isDeleted: true } as any);

      await expect(service.remove(PROPERTY_ID, mockSuperadminScope())).resolves.not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // verifyTenantAccess
  // ---------------------------------------------------------------------------
  describe('verifyTenantAccess', () => {
    it('should pass for matching tenant', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);

      await expect(
        service.verifyTenantAccess(PROPERTY_ID, mockTenantScope(TENANT_A)),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException for cross-tenant access', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);

      await expect(
        service.verifyTenantAccess(PROPERTY_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to bypass', async () => {
      mockRepo.findById.mockResolvedValue(baseProperty as any);

      await expect(
        service.verifyTenantAccess(PROPERTY_ID, mockSuperadminScope()),
      ).resolves.not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    const dto: CreatePropertyDto = {
      propertyName: 'New Property',
      propertyAddress: '456 Elm St',
      id_tenant: TENANT_A,
    };

    it('should auto-set id_tenant from TENANT scope (ignoring dto value)', async () => {
      mockRepo.create.mockImplementation(async (data) => ({ ...data, id_property: 'new-1' } as any));

      await service.create({ ...dto, id_tenant: TENANT_B }, mockTenantScope(TENANT_A));

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_tenant: TENANT_A }),
      );
    });

    it('should use body id_tenant for SUPERADMIN', async () => {
      mockRepo.create.mockImplementation(async (data) => ({ ...data, id_property: 'new-2' } as any));

      await service.create(dto, mockSuperadminScope());

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_tenant: TENANT_A }),
      );
    });

    it('should throw BadRequestException when SUPERADMIN provides no id_tenant', async () => {
      await expect(
        service.create({ propertyName: 'X', propertyAddress: 'Y' }, mockSuperadminScope()),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
