

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';



const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { identifier, password, rememberMe } = formData;

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      setMessage('Login successful! Redirecting...');
      // Redirect to dashboard on successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="form-bg">
      <div className="form-card">
        <h2>Login</h2>
        <form onSubmit={onSubmit}>
          <label>Phone or Email:</label>
          <input
            type="text"
            name="identifier"
            value={identifier}
            onChange={onChange}
            placeholder="Enter phone or email"
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Password"
            required
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={rememberMe}
              onChange={onChange}
            />
            Remember Me
          </label>

          <button type="submit">Login</button>
        </form>
        <div className="form-alt-link" style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '1rem', color: '#ffffffff' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#3730a3', fontWeight: 700, textDecoration: 'underline' }}>Register</Link>
        </div>
        {message && (
          <p style={{ color: message.toLowerCase().includes('success') ? '#22c55e' : '#e11d48', marginTop: '1rem', fontWeight: 500, textAlign: 'center' }}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Login;
