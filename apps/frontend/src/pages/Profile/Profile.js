import React, { useState, useEffect } from 'react';
import { userService } from '../../api/userService';
import ErrorPanel from '../../components/ErrorPanel/ErrorPanel';
import '../../styles/global.css';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    userService.getMe()
      .then(setUser)
      .catch(err => {
        console.error('Error fetching profile:', err);
        setError(err);
      });
  }, [])

  if (error?.status === 403) return <ErrorPanel variant="forbidden" />;
  if (error) return <ErrorPanel variant="error" message={error.message} />;
  if (!user) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <h1>Profile</h1>
      <div className="card profile-card">
        <p><span>Name</span>{user.firstName} {user.lastName}</p>
        <p><span>Email</span>{user.email}</p>
        <p><span>Role</span>{user.role}</p>
        {user.id_tenant && <p><span>Tenant</span>{user.id_tenant}</p>}
      </div>
    </div>
  );
}

export default Profile;
