import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useUser } from './UserContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0, deliveryFee: 0 });
  const { user } = useUser();

  // Fetch cart on mount or user change
  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [], total: 0, deliveryFee: 0 });
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch {
      setCart({ items: [], total: 0, deliveryFee: 0 });
    }
  };

  const addToCart = async (menuItemId, quantity = 1) => {
    if (!menuItemId){
      console.error("No menuItemId provided");
      return;
    }
    const qty = Number(quantity);
    if(!Number.isInteger(qty) || qty < 1){
      console.error("Invalid quantity passed to addToCart:", quantity);
      return;
    }
    try{
      await api.post('/cart/add', {menuItemId, quantity: qty});
      fetchCart();
    }catch(err){
      console.error("Failed to update cart", err.response?.data || err.message);
    }
  };

  const removeFromCart = async (menuItemId) => {
    try{
      const res = await api.post('/cart/remove', {menuItemId});
      if (res && res.data) setCart(res.data);
    }catch (err){
      console.error('Failed to remove from cart', err.response?.data || err.message);
    }
  };

  const clearCart = async () => {
    await api.post('/cart/clear');
    fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
