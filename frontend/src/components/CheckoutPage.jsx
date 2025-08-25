import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValidPhone = (phone) => /^01\d{9}$/.test(phone);

  const handlePlaceOrder = async () => {
    setError('');
    setSuccess('');

    if (!customerName.trim()) {
      setError('Name is required');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!isValidPhone(customerPhone)) {
      setError('Enter a valid 11-digit phone number starting with 01');
      return;
    }
    if (!cart?.items || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      await api.post('/orders/checkout', {
        customerName,
        customerPhone,
        customerEmail,
        items: cart.items,
        deliveryFee: cart.deliveryFee || 0,
        total: cart.total,
        paymentMethod
      });

      clearCart();
      setSuccess('Order placed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '1rem',
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      marginBottom: '2rem',
      color: '#111',
    },
    inputGroup: {
      width: '100%',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    label: {
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: '#111',
      width: '100%',
      textAlign: 'left',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '700',
      color: '#111',
      outline: 'none',
      textAlign: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '700',
      color: '#111',
      outline: 'none',
      textAlign: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
    },
    priceText: {
      fontWeight: '700',
      fontSize: '1.2rem',
      color: '#111',
      marginBottom: '0.5rem',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#0095f6',
      color: '#fff',
      fontWeight: '700',
      fontSize: '1rem',
      cursor: loading || !cart?.items?.length ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s ease',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Checkout</h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem', fontWeight: '700' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: '1rem', fontWeight: '700' }}>{success}</p>}

        {/* Inputs */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone</label>
          <input
            type="text"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email (optional)</label>
          <input
            type="email"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            placeholder="Enter your email"
            style={styles.input}
          />
        </div>

        {/* Payment */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            style={styles.select}
          >
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Card">Card Payment</option>
          </select>
        </div>

        {/* Delivery Fee */}
        <div style={styles.priceText}>Delivery Fee: ৳{cart?.deliveryFee || 0}</div>

        {/* Total */}
        <div style={{ ...styles.priceText, fontSize: '1.4rem', marginBottom: '1.5rem' }}>
          Total: ৳{cart?.total || 0}
        </div>

        {/* Place Order */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading || !cart?.items?.length}
          style={styles.button}
          onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#007acc'; }}
          onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#0095f6'; }}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
