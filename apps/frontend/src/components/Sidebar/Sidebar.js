import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isClient } from '../../utils/auth';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/signin');
  };

  return (
    <nav className="sidebar">
      <ul className="sidebar-nav">
        <li><NavLink to="/" end>Home</NavLink></li>
        {!isClient() && <li><NavLink to="/user">Users</NavLink></li>}
        {!isClient() && <li><NavLink to="/tenant">Tenants</NavLink></li>}
        <li><NavLink to="/profile">Profile</NavLink></li>
      </ul>
      <button className="sidebar-logout" onClick={handleLogout}>Log out</button>
    </nav>
  );
}

export default Sidebar;
