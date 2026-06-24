import { useEffect, useState } from 'react';
import type { Tenant } from '@RealEstate/types';
import { tenantApi } from '../../shared/api/services';

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tenantApi.list()
      .then(setTenants)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <section>
      <h2 className="text-xs font-bold text-text tracking-[0.06em] uppercase mb-3">Tenants</h2>
      <p className="text-xs text-text-muted mt-1 mb-4">All agencies on the platform.</p>
      {error && (
        <div className="border border-dashed border-border-strong rounded-radius py-9 px-5 text-center text-text-muted bg-surface">
          Couldn't load tenants: {error}
        </div>
      )}
      {!error && tenants === null && (
        <div className="border border-dashed border-border-strong rounded-radius py-9 px-5 text-center text-text-muted bg-surface">
          Loading…
        </div>
      )}
      {!error && tenants !== null && tenants.length === 0 && (
        <div className="border border-dashed border-border-strong rounded-radius py-9 px-5 text-center text-text-muted bg-surface">
          No tenants yet.
        </div>
      )}
      {!error && tenants && tenants.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {tenants.map(t => (
            <div
              key={t.id_tenant}
              className="bg-surface border border-border rounded-radius py-4 px-[18px] shadow-sm flex flex-col gap-2"
            >
              <div className="text-[14px] font-bold text-text tracking-[-0.01em]">{t.name}</div>
              <div className="text-xs text-text-muted">{t.customDomain ?? 'no custom domain'}</div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-text-muted">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.06em] uppercase bg-brand-primary-soft text-brand-primary">
                  {t.id_plan ? 'On plan' : 'No plan'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
