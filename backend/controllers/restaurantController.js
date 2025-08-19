import Restaurant from '../models/restaurant.js';
import User from '../models/user.js';
import Rating from '../models/rating.js';
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



// Get detailed restaurant information
export const getRestaurantDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get restaurant with owner info
    const restaurant = await Restaurant.findById(id)
      .populate('owner', 'name restaurantName restaurantDescription menuItems restaurantLocation');
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Get recent ratings with user info
    const recentRatings = await Rating.find({ restaurant: id })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Calculate estimated delivery time based on current time and restaurant status
    const now = new Date();
    
    // FIX: Get weekday correctly
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    let isOpen = true;
    let estimatedDelivery = restaurant.estimatedDeliveryTime;
    
    // Check if restaurant has custom opening hours
    if (restaurant.openingHours && restaurant.openingHours[currentDay]) {
      const dayHours = restaurant.openingHours[currentDay];
      if (dayHours.closed || 
          currentTime < dayHours.open || 
          currentTime > dayHours.close) {
        isOpen = false;
      }
    }
    
    // Get menu items from owner
    let menuItems = [];
    if (restaurant.owner && restaurant.owner.menuItems) {
      menuItems = restaurant.owner.menuItems.filter(item => item.isAvailable);
    }
    
    // Group menu items by category
    const categorizedMenu = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push({
        _id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        isAvailable: item.isAvailable
      });
      return acc;
    }, {});
    
    const response = {
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        cuisineType: restaurant.cuisineType,
        location: restaurant.location,
        averageRating: Math.round(restaurant.averageRating * 10) / 10,
        totalRatings: restaurant.totalRatings,
        ratingBreakdown: restaurant.ratingBreakdown,
        estimatedDeliveryTime: estimatedDelivery,
        deliveryFee: restaurant.deliveryFee,
        minOrderAmount: restaurant.minOrderAmount,
        isOpen,
        isAvailable: restaurant.isAvailable && isOpen,
        restaurantDescription: restaurant.owner?.restaurantDescription || '',
        openingHours: restaurant.openingHours || {
          default: restaurant.defaultOpeningHours
        }
      },
      menuItems: categorizedMenu,
      recentRatings: recentRatings.map(rating => ({
        _id: rating._id,
        rating: rating.rating,
        review: rating.review,
        userName: rating.user?.name || 'Anonymous',
        createdAt: rating.createdAt,
        orderExperience: rating.orderExperience
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Get restaurant details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Submit or update restaurant rating
export const rateRestaurant = async (req, res) => {
  try {
    const { id } = req.params; // restaurant id
    const { rating, review, orderExperience } = req.body;
    const userId = req.user._id;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user already rated this restaurant
    let existingRating = await Rating.findOne({ user: userId, restaurant: id });
    
    if (existingRating) {
      // Update existing rating
      const oldRating = existingRating.rating;
      
      existingRating.rating = rating;
      existingRating.review = review || '';
      existingRating.orderExperience = orderExperience || {};
      
      await existingRating.save();
      
      // Update restaurant's average rating
      restaurant.updateRating(rating, oldRating);
      await restaurant.save();
      
      res.json({
        message: 'Rating updated successfully',
        rating: existingRating,
        restaurantRating: {
          averageRating: Math.round(restaurant.averageRating * 10) / 10,
          totalRatings: restaurant.totalRatings
        }
      });
      
    } else {
      // Create new rating
      const newRating = new Rating({
        user: userId,
        restaurant: id,
        rating,
        review: review || '',
        orderExperience: orderExperience || {}
      });
      
      await newRating.save();
      
      // Update restaurant's average rating
      restaurant.updateRating(rating);
      await restaurant.save();
      
      res.status(201).json({
        message: 'Rating submitted successfully',
        rating: newRating,
        restaurantRating: {
          averageRating: Math.round(restaurant.averageRating * 10) / 10,
          totalRatings: restaurant.totalRatings
        }
      });
    }
    
  } catch (error) {
    console.error('Rate restaurant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's rating for a restaurant
export const getUserRating = async (req, res) => {
  try {
    const { id } = req.params; // restaurant id
    const userId = req.user._id;
    
    const rating = await Rating.findOne({ user: userId, restaurant: id });
    
    if (!rating) {
      return res.json({ hasRated: false, rating: null });
    }
    
    res.json({
      hasRated: true,
      rating: {
        _id: rating._id,
        rating: rating.rating,
        review: rating.review,
        orderExperience: rating.orderExperience,
        createdAt: rating.createdAt
      }
    });
    
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user's rating
export const deleteRating = async (req, res) => {
  try {
    const { id } = req.params; // restaurant id
    const userId = req.user._id;
    
    const rating = await Rating.findOne({ user: userId, restaurant: id });
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    const restaurant = await Restaurant.findById(id);
    if (restaurant) {
      restaurant.removeRating(rating.rating);
      await restaurant.save();
    }
    
    await Rating.deleteOne({ _id: rating._id });
    
    res.json({
      message: 'Rating deleted successfully',
      restaurantRating: {
        averageRating: Math.round(restaurant.averageRating * 10) / 10,
        totalRatings: restaurant.totalRatings
      }
    });
    
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all ratings for a restaurant (with pagination)
export const getRestaurantRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const ratings = await Rating.find({ restaurant: id })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalRatings = await Rating.countDocuments({ restaurant: id });
    
    res.json({
      ratings: ratings.map(rating => ({
        _id: rating._id,
        rating: rating.rating,
        review: rating.review,
        userName: rating.user?.name || 'Anonymous',
        createdAt: rating.createdAt,
        orderExperience: rating.orderExperience
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRatings / limit),
        totalRatings,
        hasMore: skip + ratings.length < totalRatings
      }
    });
    
  } catch (error) {
    console.error('Get restaurant ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Admin: Assign owner to restaurant
export const assignOwner = async (req, res) => {
  try {
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { restaurantId, ownerId } = req.body;

    if (!restaurantId || !ownerId) {
      return res.status(400).json({ message: 'Restaurant ID and Owner ID are required' });
    }

    // Check if owner exists and is actually an owner
    const owner = await User.findById(ownerId);
    if (!owner || owner.userType !== 'Owner') {
      return res.status(400).json({ message: 'Invalid owner ID or user is not an owner' });
    }

    // Update restaurant
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { owner: ownerId },
      { new: true }
    ).populate('owner', 'name restaurantName');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({
      message: 'Owner assigned successfully',
      restaurant
    });

  } catch (error) {
    console.error('Assign owner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
