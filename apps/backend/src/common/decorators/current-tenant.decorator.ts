import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { TenantScope } from '../types/tenant-scope';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantScope => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === 'SUPERADMIN') {
      return { type: 'ALL' };
    }

    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }

    return { type: 'TENANT', tenantId: user.tenantId };
  },
);
