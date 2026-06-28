import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TenantService } from './tenant.service';
import { TenantRepository } from './tenant.repository';
import { ThemeService } from '../theme/theme.service';

describe('TenantService', () => {
  let service: TenantService;
  let mockTenantRepository: Record<string, jest.Mock>;
  let mockThemeService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockTenantRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      existsByName: jest.fn(),
      existsById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      assignTheme: jest.fn(),
    };

    mockThemeService = {
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: TenantRepository, useValue: mockTenantRepository },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const createTenantDto = {
    name: 'Test Tenant',
    customDomain: 'test.tenant.com',
    id_plan: 'FREE',
  };

  const updateTenantDto = {
    name: 'Updated Tenant',
    customDomain: 'updated.tenant.com',
    id_plan: 'PAID',
  };

  describe('create', () => {
    it('should create a tenant', async () => {
      mockTenantRepository.existsByName.mockResolvedValue(false);
      mockTenantRepository.create.mockResolvedValue({
        id_tenant: 'tenant123',
        name: createTenantDto.name,
        customDomain: createTenantDto.customDomain,
      });

      const result = await service.create(createTenantDto);

      expect(result).toEqual({
        id_tenant: 'tenant123',
        name: createTenantDto.name,
        customDomain: createTenantDto.customDomain,
      });

      expect(mockTenantRepository.existsByName).toHaveBeenCalledWith(
        createTenantDto.name,
      );
      expect(mockTenantRepository.create).toHaveBeenCalledWith({
        name: createTenantDto.name,
        customDomain: createTenantDto.customDomain,
        id_plan: createTenantDto.id_plan,
      });
    });

    it('should throw ConflictException if tenant already exists', async () => {
      mockTenantRepository.existsByName.mockResolvedValue(true);
      await expect(service.create(createTenantDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockTenantRepository.existsByName).toHaveBeenCalledWith(
        createTenantDto.name,
      );
      expect(mockTenantRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      const tenants = [{ id_tenant: '1', name: 'Tenant 1' }];
      mockTenantRepository.findAll.mockResolvedValue(tenants);

      const result = await service.findAll();
      expect(result).toEqual(tenants);
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      const tenant = { id_tenant: 'tenant123', name: 'Test Tenant' };
      mockTenantRepository.findById.mockResolvedValue(tenant);

      const result = await service.findOne('tenant123');
      expect(result).toEqual(tenant);
      expect(mockTenantRepository.findById).toHaveBeenCalledWith(
        'tenant123',
        false,
      );
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      mockTenantRepository.existsByName.mockResolvedValue(false);
      mockTenantRepository.existsById.mockResolvedValue(true);
      mockTenantRepository.update.mockResolvedValue({
        id_tenant: 'tenant123',
        name: updateTenantDto.name,
        customDomain: updateTenantDto.customDomain,
      });

      const result = await service.update('tenant123', updateTenantDto);

      expect(result).toEqual({
        id_tenant: 'tenant123',
        name: updateTenantDto.name,
        customDomain: updateTenantDto.customDomain,
      });
    });

    it('should throw BadRequestException if no fields provided', async () => {
      await expect(service.update('tenant123', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantRepository.existsByName.mockResolvedValue(false);
      mockTenantRepository.existsById.mockResolvedValue(false);
      await expect(
        service.update('nonexistent', updateTenantDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a tenant', async () => {
      mockTenantRepository.existsById.mockResolvedValue(true);
      mockTenantRepository.softDelete.mockResolvedValue({
        id_tenant: 'tenant123',
        name: 'Test',
      });

      const result = await service.remove('tenant123');
      expect(result).toEqual({ id_tenant: 'tenant123', name: 'Test' });
      expect(mockTenantRepository.softDelete).toHaveBeenCalledWith('tenant123');
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantRepository.existsById.mockResolvedValue(false);
      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignTheme', () => {
    it('should assign an existing theme to the tenant', async () => {
      mockTenantRepository.findById.mockResolvedValue({
        id_tenant: 'tenant123',
        name: 'Test',
      });
      mockThemeService.findOne.mockResolvedValue({ id_theme: 'theme1' });
      mockTenantRepository.assignTheme.mockResolvedValue({
        id_tenant: 'tenant123',
        id_theme: 'theme1',
      });

      const result = await service.assignTheme('tenant123', 'theme1');
      expect(result).toEqual({ id_tenant: 'tenant123', id_theme: 'theme1' });
      expect(mockThemeService.findOne).toHaveBeenCalledWith('theme1');
      expect(mockTenantRepository.assignTheme).toHaveBeenCalledWith(
        'tenant123',
        'theme1',
      );
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);
      await expect(
        service.assignTheme('nonexistent', 'theme1'),
      ).rejects.toThrow(NotFoundException);
      expect(mockThemeService.findOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if the theme already belongs to another tenant', async () => {
      mockTenantRepository.findById.mockResolvedValue({
        id_tenant: 'tenant123',
        name: 'Test',
      });
      mockThemeService.findOne.mockResolvedValue({ id_theme: 'theme1' });
      mockTenantRepository.assignTheme.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.assignTheme('tenant123', 'theme1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateAssignedTheme', () => {
    it('should patch the existing theme fields', async () => {
      mockTenantRepository.findById
        .mockResolvedValueOnce({
          id_tenant: 'tenant123',
          name: 'Test',
          id_theme: 'theme1',
        })
        .mockResolvedValueOnce({ id_tenant: 'tenant123', id_theme: 'theme1' });

      const result = await service.updateAssignedTheme('tenant123', {
        brandColor: '#123456',
      });
      expect(result).toEqual({ id_tenant: 'tenant123', id_theme: 'theme1' });
      expect(mockThemeService.update).toHaveBeenCalledWith('theme1', {
        brandColor: '#123456',
      });
    });

    it('should throw BadRequestException if no fields provided', async () => {
      mockTenantRepository.findById.mockResolvedValue({
        id_tenant: 'tenant123',
        name: 'Test',
        id_theme: 'theme1',
      });
      await expect(
        service.updateAssignedTheme('tenant123', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);
      await expect(
        service.updateAssignedTheme('nonexistent', { brandColor: '#123456' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
