import React, { useState, useEffect } from 'react';
import { userService } from '../../api/userService';
import '../../styles/global.css';
import './UserList.css';
import { UserRoles, UserResponseDto } from '@RealEstate/types';

function UserCard({ user }: { user: UserResponseDto }) {
  const [role, setRole] = useState(user.role)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // TODO: call update user enpoint
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    return
  }

  return (
    <li key={user.id_user} className="card user-item">
      <h2>{user.firstName} {user.lastName}</h2>
      <p>{user.email}</p>
      <select name='role-select' id='role-select' value={role} onChange={e => setRole(e.target.value as UserRoles)}>
        {Object.values(UserRoles).map(role => (
          <option value={role}>{role}</option>
        ))}
      </select>
      <button onClick={handleSave} disabled={saving || role === user.role}>{saving ? 'Saving...' : 'Save'}</button>
    </li>

  )

}

function UserList() {
  const [users, setUsers] = useState<UserResponseDto[]>([]);

  useEffect(() => {
    userService.getAll()
      .then(setUsers)
      .catch(err => console.error('Error fetching users:', err));
  }, [])

  return (
    <ul className='card-list'>
      {users.map(user => (
        <UserCard key={user.id_user} user={user}></UserCard>
      ))
      }
    </ul>
  )
}

export default UserList;
