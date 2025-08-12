


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';



const Register = () => {
  const [formData, setFormData] = useState({
    userType: 'Customer',
    phone: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const { userType, phone, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      setMessage('Successfully registered! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-bg">
      <div className="form-card">
        <h2>Register</h2>
        <form onSubmit={onSubmit}>
          <label>User Type:</label>
          <select name="userType" value={userType} onChange={onChange}>
            <option value="Admin">Admin</option>
            <option value="Owner">Owner</option>
            <option value="Customer">Customer</option>
          </select>

          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={phone}
            onChange={onChange}
            placeholder="Phone number"
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Email address"
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

          <button type="submit">Register</button>
        </form>
        {message && (
          <p style={{ color: message.toLowerCase().includes('success') ? '#22c55e' : '#e11d48', marginTop: '1rem', fontWeight: 500, textAlign: 'center' }}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Register;
