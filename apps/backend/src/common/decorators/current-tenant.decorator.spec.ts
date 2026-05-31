import { ForbiddenException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentTenant } from './current-tenant.decorator';
import { TENANT_A } from '../testing/tenant-test.helpers';

/**
 * Extracts the factory function behind a param decorator created
 * with `createParamDecorator`. Works by applying the decorator to a
 * dummy class method parameter and reading the resulting metadata.
 */
function getParamDecoratorFactory(decorator: Function) {
  class Test {
    test(@decorator() _value: unknown) {}
  }

  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  const key = Object.keys(metadata)[0];
  return metadata[key].factory;
}

function mockExecutionContext(user: Record<string, unknown>) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  };
}

describe('CurrentTenant decorator', () => {
  const factory = getParamDecoratorFactory(CurrentTenant);

  it('should return { type: "ALL" } for SUPERADMIN user', () => {
    const ctx = mockExecutionContext({ role: 'SUPERADMIN', tenantId: null });
    const result = factory(undefined, ctx);
    expect(result).toEqual({ type: 'ALL' });
  });

  it('should return { type: "TENANT", tenantId } for ADMIN user', () => {
    const ctx = mockExecutionContext({ role: 'ADMIN', tenantId: TENANT_A });
    const result = factory(undefined, ctx);
    expect(result).toEqual({ type: 'TENANT', tenantId: TENANT_A });
  });

  it('should return { type: "TENANT", tenantId } for EMPLOYEE user', () => {
    const ctx = mockExecutionContext({ role: 'EMPLOYEE', tenantId: TENANT_A });
    const result = factory(undefined, ctx);
    expect(result).toEqual({ type: 'TENANT', tenantId: TENANT_A });
  });

  it('should throw ForbiddenException when non-SUPERADMIN has no tenantId (null)', () => {
    const ctx = mockExecutionContext({ role: 'ADMIN', tenantId: null });
    expect(() => factory(undefined, ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when non-SUPERADMIN has undefined tenantId', () => {
    const ctx = mockExecutionContext({ role: 'EMPLOYEE', tenantId: undefined });
    expect(() => factory(undefined, ctx)).toThrow(ForbiddenException);
  });
});
