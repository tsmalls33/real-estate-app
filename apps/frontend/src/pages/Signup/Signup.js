import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/authService';
import '../../styles/global.css';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await authService.signup(form);
      navigate('/signin');
    } catch (err) {
      if (err.status) setError(err.message || 'Could not create account');
      else setError('Could not reach server');
    }
  };

  return (
    <div className="auth-container">
      <h2>Create account</h2>
      <div className="auth-card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>First name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Last name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary">Sign up</button>
        </form>
        <p className="form-footer">Already have an account? <Link to="/signin">Sign in</Link></p>
      </div>
    </div>
  );
}

export default Signup;
