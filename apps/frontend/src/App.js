import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import UserList from './pages/UserList/UserList';
import TenantList from './pages/TenantList/TenantList';
import PropertyList from './pages/PropertyList/PropertyList'
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import Sidebar from './components/Sidebar/Sidebar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

function App() {
  const location = useLocation();
  const hideSidebar = ['/signin', '/signup'].includes(location.pathname);

  return (
    <div style={{ display: 'flex' }}>
      {!hideSidebar && <Sidebar />}
      <div style={{ flex: 1 }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/signin" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/user" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
            <Route path="/tenant" element={<ProtectedRoute><TenantList /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/properties" element={<ProtectedRoute><PropertyList /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
