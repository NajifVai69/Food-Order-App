import ManageRestaurant from '../models/manageRestaurant.js';
import Restaurant from '../models/restaurant.js';

// Admin: Add restaurant
export const addRestaurant = async (req, res) => {
  try {
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    const { name, location, cuisineType, isAvailable } = req.body;
    if (!name || !location || !location.city || !cuisineType) {
      return res.status(400).json({ message: 'Name, city, and cuisine type are required.' });
    }
    const restaurant = new ManageRestaurant({ name, location, cuisineType, isAvailable: isAvailable !== undefined ? isAvailable : true, createdBy: req.user._id });
    await restaurant.save();
    // Sync to public Restaurant collection
    const publicRestaurant = new Restaurant({ name, location, cuisineType, isAvailable: isAvailable !== undefined ? isAvailable : true });
    await publicRestaurant.save();
    res.json({ message: 'Restaurant added successfully', restaurant });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    const { id } = req.params;
    await ManageRestaurant.findByIdAndDelete(id);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all restaurants
export const getRestaurants = async (req, res) => {
  try {
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    const restaurants = await ManageRestaurant.find().lean();
    res.json({ restaurants });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
