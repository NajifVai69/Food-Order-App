import Restaurant from '../models/restaurant.js';
import User from '../models/user.js';

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
    const restaurant = new Restaurant({
      name,
      location,
      cuisineType,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });
    await restaurant.save();
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
    await Restaurant.findByIdAndDelete(id);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Public: Get restaurants (for browsing)
// Public: Get restaurants (for browsing)
export const getRestaurants = async (req, res) => {
  try {
    const { location, cuisine, availability } = req.query;

    // Case 1: No filters → return all
    if (!location && !cuisine && !availability) {
      const restaurants = await Restaurant.find({}).lean();
      return res.json({ restaurants });
    }

    // Case 2: All three filters are present → filter strictly
    if (location && cuisine && availability) {
      const andQuery = {
        $and: [
          {
            $or: [
              { 'location.city': { $regex: location, $options: 'i' } },
              { 'location.area': { $regex: location, $options: 'i' } }
            ]
          },
          { 'cuisineType': { $regex: cuisine, $options: 'i' } },
          { 'isAvailable': availability.toLowerCase() === 'available' }
        ]
      };
      const restaurants = await Restaurant.find(andQuery).lean();
      return res.json({ restaurants });
    }

    // Case 3: If not all three filters provided → return all
    const restaurants = await Restaurant.find({}).lean();
    return res.json({ restaurants });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

