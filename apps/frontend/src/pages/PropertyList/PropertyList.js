import React, { useState, useEffect } from 'react';
import { propertyService } from '../../api/propertyService';
import ErrorPanel from '../../components/ErrorPanel/ErrorPanel';
import '../../styles/global.css';
import './PropertyList.css'

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    propertyService.getAll()
      .then(setProperties)
      .catch(err => {
        console.error('Error fetching properties:', err);
        setError(err);
      });
  }, [])

  if (error?.status === 403) return <ErrorPanel variant="forbidden" />;
  if (error) return <ErrorPanel variant="error" message={error.message} />;

  return (
    <div className="page-container" >
      <h1>Properties </h1>
      < ul className="card-list" >
        {
          properties.map(property => (
            <li key={property.id_property} className="card property-item" >
              <h2>{property.propertyName}  </h2>
              < p > {property.propertyAddress} </p>
              < p > {property.id_tenant} </p>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default PropertyList;
