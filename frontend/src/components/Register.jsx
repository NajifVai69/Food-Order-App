


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    userType: 'Customer',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const navigate = useNavigate();

  const { userType, phone, email, password, confirmPassword } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    if (!phone && !email) {
      setMessage('Please provide either phone number or email');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      setMessage('Registration successful! Redirecting to login...');
      setReferralCode(res.data.referralCode);
      
      // Show success message with referral code
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-bg">
      <div className="form-card">
        <h2>Register</h2>
        
        <form onSubmit={handleSubmit}>
          <label>User Type:</label>
          <select name="userType" value={userType} onChange={onChange}>
            <option value="Customer">Customer</option>
            <option value="Owner">Restaurant Owner</option>
            <option value="Admin">Admin</option>
          </select>

          <label>Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={onChange}
            placeholder="+880 1XXXXXXXXX"
          />

          <label>Email Address:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="your@email.com"
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Minimum 6 characters"
            required
          />

          <label>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            placeholder="Confirm your password"
            required
          />

          <label>Referral Code (Optional):</label>
          <input
            type="text"
            name="referralCode"
            value={formData.referralCode}
            onChange={onChange}
            placeholder="Enter referral code"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {referralCode && (
          <div style={{ 
            background: '#f0f9ff', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            textAlign: 'center'
          }}>
            <p><strong>Your Referral Code:</strong> {referralCode}</p>
            <p>Share this code with friends to earn rewards!</p>
          </div>
        )}
        
        <div className="form-alt-link" style={{ marginTop: '1.2rem', textAlign: 'center', fontSize: '1rem', color: '#ffffffff' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3730a3', fontWeight: 700, textDecoration: 'underline' }}>Login</Link>
        </div>
        
        {message && (
          <p style={{ 
            color: message.toLowerCase().includes('success') ? '#22c55e' : '#e11d48', 
            marginTop: '1rem', 
            fontWeight: 500, 
            textAlign: 'center' 
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
