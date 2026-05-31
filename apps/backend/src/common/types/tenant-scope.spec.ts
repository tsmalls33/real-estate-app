import { NotFoundException } from '@nestjs/common';
import { assertTenantMatch, tenantFilter, type TenantScope } from './tenant-scope';

describe('tenant-scope utilities', () => {
  const allScope: TenantScope = { type: 'ALL' };
  const tenantScope: TenantScope = { type: 'TENANT', tenantId: 'tenant-abc' };

  describe('assertTenantMatch', () => {
    it('passes for ALL scope', () => {
      expect(() => assertTenantMatch(allScope, 'tenant-abc')).not.toThrow();
    });

    it('passes for ALL scope even with null recordTenantId', () => {
      expect(() => assertTenantMatch(allScope, null)).not.toThrow();
    });

    it('passes when TENANT scope matches record', () => {
      expect(() => assertTenantMatch(tenantScope, 'tenant-abc')).not.toThrow();
    });

    it('throws NotFoundException for TENANT scope mismatch', () => {
      expect(() => assertTenantMatch(tenantScope, 'tenant-other')).toThrow(NotFoundException);
    });

    it('throws NotFoundException when record tenantId is null', () => {
      expect(() => assertTenantMatch(tenantScope, null)).toThrow(NotFoundException);
    });
  });

  describe('tenantFilter', () => {
    it('returns empty object for ALL scope', () => {
      expect(tenantFilter(allScope)).toEqual({});
    });

    it('returns empty object for ALL scope with path', () => {
      expect(tenantFilter(allScope, 'property')).toEqual({});
    });

    it('returns { id_tenant } for TENANT scope', () => {
      expect(tenantFilter(tenantScope)).toEqual({ id_tenant: 'tenant-abc' });
    });

    it('returns nested filter for TENANT scope with path', () => {
      expect(tenantFilter(tenantScope, 'property')).toEqual({
        property: { id_tenant: 'tenant-abc' },
      });
    });

    it('ALL scope spread is a no-op in a where clause', () => {
      const where = { isDeleted: false, ...tenantFilter(allScope) };
      expect(where).toEqual({ isDeleted: false });
    });

    it('TENANT scope spread adds id_tenant to where clause', () => {
      const where = { isDeleted: false, ...tenantFilter(tenantScope) };
      expect(where).toEqual({ isDeleted: false, id_tenant: 'tenant-abc' });
    });

    it('TENANT scope nested spread adds relation filter', () => {
      const where = { isDeleted: false, ...tenantFilter(tenantScope, 'property') };
      expect(where).toEqual({ isDeleted: false, property: { id_tenant: 'tenant-abc' } });
    });
  });
});
