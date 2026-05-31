import React, { useState, useEffect } from 'react';
import { userService } from '../../api/userService';
import '../../styles/global.css';
import './UserList.css';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userService.getAll()
      .then(setUsers)
      .catch(err => console.error('Error fetching users:', err));
  }, [])

  return (
    <div className="page-container">
      <h1>Users</h1>
      <ul className="card-list">
        {users.map(user => (
          <li key={user.id_user} className="card user-item">
            <h2>{user.firstName} {user.lastName}</h2>
            <p>{user.email}</p>
            <p>{user.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
