import React, { useState, useEffect } from 'react';
import { userService } from '../../api/userService';
import '../../styles/global.css';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userService.getMe()
      .then(setUser)
      .catch(err => console.error('Error fetching profile:', err));
  }, [])

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
