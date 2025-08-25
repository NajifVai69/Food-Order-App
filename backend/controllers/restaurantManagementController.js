import Restaurant from '../models/restaurant.js';
import User from '../models/user.js';

// Get restaurants assigned to owner
export const getAssignedRestaurants = async (req, res) => {
  try {
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    const restaurants = await Restaurant.find({ owner: req.user._id })
      .select('name description location cuisineType isAvailable menuItems averageRating totalRatings estimatedDeliveryTime deliveryFee')
      .lean();

    res.json({
      message: 'Assigned restaurants fetched successfully',
      restaurants
    });
  } catch (error) {
    console.error('Get assigned restaurants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update restaurant info (owner only)
export const updateRestaurantInfo = async (req, res) => {
  try {
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    const { restaurantId } = req.params;
    const { name, description, location, cuisineType, isAvailable, estimatedDeliveryTime, deliveryFee, minOrderAmount } = req.body;

    // Verify owner owns this restaurant
    const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or you do not have permission' });
    }

    // Update allowed fields
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (location) updateData.location = location;
    if (cuisineType) updateData.cuisineType = cuisineType;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (estimatedDeliveryTime) updateData.estimatedDeliveryTime = estimatedDeliveryTime;
    if (deliveryFee !== undefined) updateData.deliveryFee = deliveryFee;
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add menu item to restaurant
export const addMenuItem = async (req, res) => {
  try {
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    const { restaurantId } = req.params;
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({ message: 'Name, description, price, category, and stock are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }
    if (stock < 0) {
      return res.status(400).json({ message: 'Stock must be 0 or greater' });
    }

    // Verify owner owns this restaurant
    const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or you do not have permission' });
    }

    const newMenuItem = {
      name,
      description,
      price: parseFloat(price),
      category,
      image: image || '',
      isAvailable: true,
      stock: Number(stock) //ensuring stock is saved properly
    };

    restaurant.menuItems.push(newMenuItem);
    await restaurant.save();

    res.status(201).json({
      message: 'Menu item added successfully',
      menuItem: restaurant.menuItems[restaurant.menuItems.length - 1]
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    const { restaurantId, itemId } = req.params;
    const { name, description, price, category, isAvailable, image, stock } = req.body;

    // Verify owner owns this restaurant
    const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or you do not have permission' });
    }

    const menuItem = restaurant.menuItems.id(itemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Update fields if provided
    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (price && price > 0) menuItem.price = parseFloat(price);
    if (category) menuItem.category = category;
    if (image !== undefined) menuItem.image = image;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
    if (stock !== undefined && stock >= 0){
      menuItem.stock = Number(stock);
    }

    await restaurant.save();

    res.json({
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    const { restaurantId, itemId } = req.params;

    // Verify owner owns this restaurant
    const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or you do not have permission' });
    }

    const itemIndex = restaurant.menuItems.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    restaurant.menuItems.splice(itemIndex, 1);
    await restaurant.save();

    res.json({
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
