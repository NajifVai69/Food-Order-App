import Cart from '../models/cart.js';
import Restaurant from '../models/restaurant.js';

// Get current user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    res.json(cart || { items: [], total: 0, deliveryFee: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// Add or update item in cart
export const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    const qty = Number(quantity);
    if (!menuItemId || !qty || qty < 1) {
      return res.status(400).json({ message: 'Invalid item or quantity' });
    }
    // Find menu item and restaurant
    const restaurant = await Restaurant.findOne({ 'menuItems._id': menuItemId });
    if (!restaurant) return res.status(404).json({ message: 'Menu item not found' });
    const menuItem = restaurant.menuItems.id(menuItemId);
    if (!menuItem || !menuItem.isAvailable) return res.status(404).json({ message: 'Menu item not available' });
    if (menuItem.stock < quantity) return res.status(400).json({ message: 'Not enough stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    // Check if item already in cart
    const itemIndex = cart.items.findIndex(i => i.menuItem.toString() === menuItemId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = qty;
    } else {
      cart.items.push({
        menuItem: menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        restaurant: restaurant._id
      });
    }
    // Calculate total
    cart.deliveryFee = restaurant.deliveryFee || 0;
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0) + cart.deliveryFee;
    cart.updatedAt = new Date();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try{
    const {menuItem} = req.body;
    let cart = await Cart.findOne({user: req.user._id});
    if(!cart){
      return res.status(200).json({itemIndex: [], total:0, deliveryFee:0});
    }
    cart.items = cart.items.filter(i => i.menuItem.toString() !== menuItemId);

    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0) + (cart.deliveryFee || 0);
    cart.updatedAt = new Date();

    if (cart.items.length === 0){
      await Cart.findByIdAndDelete(cart._id);
      return res.status(200).json({items: [], total: 0, deliveryFee: 0});
    }
    await cart.save();
    res.status(200).json(cart);
  }catch (err){
    console.error(err);
    res.status(500).json({message: 'Failed to remove from cart'});
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};
