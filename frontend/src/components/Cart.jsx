import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.items.map(item => (
              <li key={item.menuItem} style={{ marginBottom: '1rem' }}>
                <strong>{item.name}</strong> - {item.price} BDT x {item.quantity}
                <button onClick={() => addToCart(item.menuItem, item.quantity + 1)} style={{ marginLeft: 8 }} disabled={item.quantity >= item.stock}>+</button>
                <button onClick={() => addToCart(item.menuItem, item.quantity -1)} style={{ marginLeft: 4 }} disabled={item.quantity <= 1}>-</button>
                <button onClick={() => removeFromCart(item.menuItem)} style={{ marginLeft: 8, color: 'red' }}>Remove</button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1rem' }}>
            <p>Delivery Fee: {cart.deliveryFee} BDT</p>
            <p><strong>Total: {cart.total} BDT</strong></p>
            <button onClick={clearCart} style={{ marginTop: 8 }}>Clear Cart</button>
            <button onClick={()=> navigate('/checkout')} style={{marginTop: 8, backgroundColor: 'var(--color-primary)', color:'#fff', padding: '8px 16px', border: 'none', borderRadius: 4}}>
              Proceed to Payment
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
