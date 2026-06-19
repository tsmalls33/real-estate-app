import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { tenantScopeForUser, type TenantScope } from '../types/tenant-scope';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantScope => {
    const request = ctx.switchToHttp().getRequest();
    return tenantScopeForUser(request.user);
  },
);
