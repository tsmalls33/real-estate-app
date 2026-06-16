import React, { useState, useEffect } from 'react';
import { isClient } from '../../utils/auth';
import { userService } from '../../api/userService';
import { tenantService } from '../../api/tenantService';
import { propertyService } from '../../api/propertyService'
import ErrorPanel from '../../components/ErrorPanel/ErrorPanel';
import '../../styles/global.css';
import './Home.css';

const fetchers = {
  users: () => userService.getAll(),
  tenants: () => tenantService.getAll(),
  me: () => userService.getMe(),
  properties: () => propertyService.getAll()
};

function renderData(resourceType, data) {
  if (!data) return null;
  if (resourceType !== 'me' && !Array.isArray(data)) return null;

  if (resourceType === 'me') {
    return (
      <div className="card home-card">
        <p><span>Name</span>{data.firstName} {data.lastName}</p>
        <p><span>Email</span>{data.email}</p>
        <p><span>Role</span>{data.role}</p>
        {data.id_tenant && <p><span>Tenant</span>{data.id_tenant}</p>}
      </div>
    );
  }

  return (
    <ul className="card-list">
      {data.map(item => (
        <li key={item.id_user || item.id_tenant || item.id_property} className="card home-list-item">
          {resourceType === 'users' && (
            <>
              <strong>{item.firstName} {item.lastName}</strong>
              <span>{item.email}</span>
              <span>{item.role}</span>
            </>
          )}
          {resourceType === 'tenants' && (
            <>
              <strong>{item.name}</strong>
              {item.customDomain && <span>{item.customDomain}</span>}
            </>
          )}
          {
            resourceType === 'properties' && (
              <>
                <strong>{item.propertyName}</strong>
                <p>{item.propertyAddress}</p>
              </>
            )
          }
        </li>
      ))}
    </ul>
  );
}

function Home() {
  const [resourceType, setResourceType] = useState(isClient() ? 'me' : 'users');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    fetchers[resourceType]()
      .then(setData)
      .catch(err => {
        console.error('Error fetching data:', err);
        setError(err);
      });
  }, [resourceType])

  return (
    <div className="page-container">
      <h1>Welcome</h1>
      <div className="home-buttons">
        {!isClient() && (
          <button
            className={resourceType === 'users' ? 'active' : ''}
            onClick={() => setResourceType('users')}
          >Users</button>
        )}
        {!isClient() && (
          <button
            className={resourceType === 'tenants' ? 'active' : ''}
            onClick={() => setResourceType('tenants')}
          >Tenants</button>
        )}
        {!isClient() && (
          <button
            className={resourceType === 'properties' ? 'active' : ''}
            onClick={() => setResourceType('properties')}
          >Properties</button>
        )}
        <button
          className={resourceType === 'me' ? 'active' : ''}
          onClick={() => setResourceType('me')}
        >Me</button>
      </div>
      {error?.status === 403 && <ErrorPanel variant="forbidden" />}
      {error && error.status !== 403 && <ErrorPanel variant="error" message={error.message} />}
      {!error && renderData(resourceType, data)}
    </div>
  );
}

export default Home;
