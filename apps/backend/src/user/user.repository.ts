import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { USER_PUBLIC_SELECT, USER_AUTH_SELECT } from './projections/user.projection';
import { tenantFilter, type TenantScope } from '../common/types/tenant-scope';

const AGENT_PAYMENT_SELECT = {
  id_agent_payment: true,
  dueDate: true,
  amount: true,
  isPaid: true,
  id_user: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
      select: USER_PUBLIC_SELECT,
    }) as User
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { isDeleted: false },
      select: USER_PUBLIC_SELECT,
    }) as User[]
  }

  async findAllWithSelect<T>(select: Prisma.UserSelect): Promise<T[]> {
    return await this.prisma.user.findMany({
      select,
    }) as T[]
  }

  async findById(id_user: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { id_user, isDeleted: false },
      select: USER_PUBLIC_SELECT,
    }) as User | null
  }

  async findByEmail(email: string, includePrivate: boolean = false): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      select: includePrivate ? USER_AUTH_SELECT : USER_PUBLIC_SELECT,
    }) as User | null;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      select: USER_AUTH_SELECT,
    }) as User | null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id_user: true },
    });
    return user !== null;
  }

  async existsById(id_user: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { id_user, isDeleted: false },
      select: { id_user: true },
    });
    return user !== null;
  }

  async update(id_user: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({
      where: { id_user },
      data,
      select: USER_PUBLIC_SELECT,
    }) as User;
  }

  async softDelete(id_user: string): Promise<User> {
    return await this.prisma.user.update({
      where: { id_user },
      data: { isDeleted: true },
      select: USER_PUBLIC_SELECT,
    }) as User;
  }

  async findByTenantId(id_tenant: string): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { id_tenant },
      select: USER_PUBLIC_SELECT,
    }) as User[];
  }

  async findByRole(role: Prisma.EnumUserRolesFilter): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { role },
      select: USER_PUBLIC_SELECT,
    }) as User[];
  }

  async count(): Promise<number> {
    return await this.prisma.user.count();
  }

  async countByTenant(id_tenant: string): Promise<number> {
    return await this.prisma.user.count({
      where: { id_tenant },
    });
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    scope: TenantScope,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      isDeleted: false,
      ...tenantFilter(scope),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_PUBLIC_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users: users as User[], total, page, limit };
  }

  async findByIdWithRelations(id_user: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id_user },
      include: {
        tenant: true,
        userProperties: true,
        agentProperties: true,
        agentPayments: true,
        clients: true,
      },
    }) as User | null;
  }

  async createMany(data: Prisma.UserCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.user.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { id_user: { in: ids } },
      select: USER_PUBLIC_SELECT,
    }) as User[];
  }

  async findAgentPayments(id_user: string) {
    return this.prisma.agentPayment.findMany({
      where: { id_user },
      select: AGENT_PAYMENT_SELECT,
      orderBy: { dueDate: 'asc' },
    });
  }
}
