import Restaurant from '../models/restaurantModel.js';

// @desc    Get all restaurants with filtering options
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = async (req, res) => {
  try {
    const { rating, city, search, page = 1, limit = 10 } = req.query;
    
    // Build query object
    const query = { isActive: true };
    
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }
    
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const restaurants = await Restaurant.find(query)
      .select('-__v')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Restaurant.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      },
      data: restaurants
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching restaurants',
      error: error.message
    });
  }
};

// @desc    Get single restaurant by ID with detailed info
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching restaurant',
      error: error.message
    });
  }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private (Admin)
export const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating restaurant',
      error: error.message
    });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Admin)

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating restaurant',
      error: error.message
    });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Admin)
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    await restaurant.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting restaurant',
      error: error.message
    });
  }
};


