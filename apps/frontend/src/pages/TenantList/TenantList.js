import React, { useState, useEffect } from 'react';
import { tenantService } from '../../api/tenantService';
import '../../styles/global.css';
import './TenantList.css';

function TenantList() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    tenantService.getAll()
      .then(setTenants)
      .catch(err => console.error('Error fetching tenants:', err));
  }, [])

  return (
    <div className="page-container">
      <h1>Tenants</h1>
      <ul className="card-list">
        {tenants.map(tenant => (
          <li key={tenant.id_tenant} className="card tenant-item">
            <h2>{tenant.name}</h2>
            {tenant.customDomain && <p>{tenant.customDomain}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TenantList;
