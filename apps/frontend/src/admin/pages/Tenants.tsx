import { useEffect, useState } from 'react';
import type { Tenant } from '@RealEstate/types';
import { tenantApi } from '../../shared/api/services';
import '../components/PropertyList.css';

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tenantApi.list()
      .then(setTenants)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <section>
      <h2 className="section-title">Tenants</h2>
      <p className="section-sub">All agencies on the platform.</p>
      {error && <div className="prop-empty">Couldn't load tenants: {error}</div>}
      {!error && tenants === null && <div className="prop-empty">Loading…</div>}
      {!error && tenants !== null && tenants.length === 0 && (
        <div className="prop-empty">No tenants yet.</div>
      )}
      {!error && tenants && tenants.length > 0 && (
        <div className="prop-grid">
          {tenants.map(t => (
            <div key={t.id_tenant} className="prop-card">
              <div className="prop-card-name">{t.name}</div>
              <div className="prop-card-addr">{t.customDomain ?? 'no custom domain'}</div>
              <div className="prop-card-row">
                <span className="prop-status">{t.id_plan ? 'On plan' : 'No plan'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
