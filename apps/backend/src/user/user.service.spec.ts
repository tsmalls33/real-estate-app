import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { ClientService } from '../client/client.service';
import {
  TENANT_A,
  TENANT_B,
  mockTenantScope,
  mockSuperadminScope,
} from '../common/testing/tenant-test.helpers';

const USER_ID = 'user-1';

const baseUser = {
  id_user: USER_ID,
  email: 'employee@test.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'EMPLOYEE',
  id_tenant: TENANT_A,
};

describe('UserService – tenant scoping', () => {
  let service: UserService;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockClientService: jest.Mocked<ClientService>;

  beforeEach(async () => {
    mockUserRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      existsById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findWithPagination: jest.fn(),
      findAgentPayments: jest.fn(),
      findByTenantId: jest.fn(),
      findByRole: jest.fn(),
      count: jest.fn(),
      countByTenant: jest.fn(),
      findByIdWithRelations: jest.fn(),
      createMany: jest.fn(),
      findByIds: jest.fn(),
      findAllWithSelect: jest.fn(),
      findByEmailWithPassword: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockClientService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ClientService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: ClientService, useValue: mockClientService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('10') },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // ---------------------------------------------------------------------------
  // createUser
  // ---------------------------------------------------------------------------
  describe('createUser', () => {
    const dto = {
      email: 'new@test.com',
      password: 'Str0ngP@ssw0rd!',
      firstName: 'New',
      lastName: 'User',
      id_tenant: TENANT_A,
    };

    it('should auto-set id_tenant from TENANT scope', async () => {
      mockUserRepo.existsByEmail.mockResolvedValue(false);
      mockUserRepo.create.mockResolvedValue({ ...baseUser, email: 'new@test.com' } as any);

      await service.createUser(
        { ...dto, id_tenant: TENANT_B } as any,
        mockTenantScope(TENANT_A),
      );

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant: { connect: { id_tenant: TENANT_A } },
        }),
      );
    });

    it('should use body id_tenant for SUPERADMIN', async () => {
      mockUserRepo.existsByEmail.mockResolvedValue(false);
      mockUserRepo.create.mockResolvedValue({ ...baseUser, email: 'new@test.com' } as any);

      await service.createUser(dto as any, mockSuperadminScope());

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant: { connect: { id_tenant: TENANT_A } },
        }),
      );
    });

    it('should allow SUPERADMIN to create user with no tenant', async () => {
      mockUserRepo.existsByEmail.mockResolvedValue(false);
      mockUserRepo.create.mockResolvedValue({ ...baseUser, id_tenant: null } as any);

      await service.createUser(
        { email: 'new@test.com', password: 'Str0ngP@ssw0rd!', firstName: 'X' } as any,
        mockSuperadminScope(),
      );

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant: undefined,
        }),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // findOne
  // ---------------------------------------------------------------------------
  describe('findOne', () => {
    it('should return user when tenant matches', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);

      const result = await service.findOne(USER_ID, mockTenantScope(TENANT_A));
      expect(result).toEqual(baseUser);
    });

    it('should throw NotFoundException for cross-tenant access', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);

      await expect(
        service.findOne(USER_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to bypass tenant check', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);

      const result = await service.findOne(USER_ID, mockSuperadminScope());
      expect(result).toEqual(baseUser);
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('should update when tenant matches', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);
      mockUserRepo.update.mockResolvedValue({ ...baseUser, firstName: 'Updated' } as any);

      const result = await service.update(USER_ID, { firstName: 'Updated' }, mockTenantScope(TENANT_A));
      expect(result.firstName).toBe('Updated');
    });

    it('should throw NotFoundException for cross-tenant update', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);

      await expect(
        service.update(USER_ID, { firstName: 'Hacker' }, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to update any user', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);
      mockUserRepo.update.mockResolvedValue({ ...baseUser, firstName: 'Admin' } as any);

      const result = await service.update(USER_ID, { firstName: 'Admin' }, mockSuperadminScope());
      expect(result.firstName).toBe('Admin');
    });

    it('should strip id_tenant for TENANT-scoped callers', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);
      mockUserRepo.update.mockResolvedValue(baseUser as any);

      const input = { firstName: 'Updated', id_tenant: TENANT_B };
      await service.update(USER_ID, input as any, mockTenantScope(TENANT_A));

      // The service should have deleted id_tenant from the input before passing to repo
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        USER_ID,
        expect.not.objectContaining({ id_tenant: expect.anything() }),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // remove
  // ---------------------------------------------------------------------------
  describe('remove', () => {
    it('should remove when tenant matches', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);
      mockUserRepo.softDelete.mockResolvedValue({ ...baseUser, isDeleted: true } as any);

      await expect(service.remove(USER_ID, mockTenantScope(TENANT_A))).resolves.not.toThrow();
    });

    it('should throw NotFoundException for cross-tenant remove', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);

      await expect(
        service.remove(USER_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to remove any user', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);
      mockUserRepo.softDelete.mockResolvedValue({ ...baseUser, isDeleted: true } as any);

      await expect(service.remove(USER_ID, mockSuperadminScope())).resolves.not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // findAgentPayments
  // ---------------------------------------------------------------------------
  describe('findAgentPayments', () => {
    it('should return payments when tenant matches', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);
      mockUserRepo.findAgentPayments.mockResolvedValue([]);

      const result = await service.findAgentPayments(USER_ID, mockTenantScope(TENANT_A));
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException for cross-tenant access', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);

      await expect(
        service.findAgentPayments(USER_ID, mockTenantScope(TENANT_B)),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN to bypass tenant check', async () => {
      mockUserRepo.findById.mockResolvedValue(baseUser as any);
      mockUserRepo.findAgentPayments.mockResolvedValue([]);

      const result = await service.findAgentPayments(USER_ID, mockSuperadminScope());
      expect(result).toEqual([]);
    });
  });
});
