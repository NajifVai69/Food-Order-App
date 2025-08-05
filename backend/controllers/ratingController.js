import Restaurant from '../models/restaurantModel.js';
import Rating from '../models/ratingModel.js';
import mongoose from 'mongoose'

// @desc    Create new rating for a restaurant
// @route   POST /api/ratings
// @access  Private
export const createRating = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { restaurant, foodItems, overallRating, review, experience } = req.body;
    const userId = req.user.id; // Assuming user is authenticated
    
    // Check if restaurant exists
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Check if user already rated this restaurant
    const existingRating = await Rating.findOne({ restaurant, user: userId });
    if (existingRating) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You have already rated this restaurant. Use update instead.'
      });
    }
    
    // Create new rating
    const rating = new Rating({
      restaurant,
      user: userId,
      foodItems,
      overallRating,
      review,
      experience
    });
    
    await rating.save({ session });
    
    // Update restaurant's average rating
    await updateRestaurantRating(restaurant, session);
    
    await session.commitTransaction();
    
    // Populate the response
    await rating.populate([
      { path: 'restaurant', select: 'name' },
      { path: 'user', select: 'name email' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: rating
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create rating error:', error);
    
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
      message: 'Server error while creating rating',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get all ratings for a restaurant
// @route   GET /api/ratings/restaurant/:restaurantId
// @access  Public
export const getRestaurantRatings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get ratings
    const ratings = await Rating.find({ restaurant: restaurantId })
      .populate('user', 'name')
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Rating.countDocuments({ restaurant: restaurantId });
    
    // Get rating statistics
    const stats = await Rating.aggregate([
      { $match: { restaurant: mongoose.Types.ObjectId(restaurantId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$overallRating' },
          totalRatings: { $sum: 1 },
          ratingDistribution: {
            $push: {
              $switch: {
                branches: [
                  { case: { $eq: ['$overallRating', 5] }, then: '5-star' },
                  { case: { $eq: ['$overallRating', 4] }, then: '4-star' },
                  { case: { $eq: ['$overallRating', 3] }, then: '3-star' },
                  { case: { $eq: ['$overallRating', 2] }, then: '2-star' },
                  { case: { $eq: ['$overallRating', 1] }, then: '1-star' }
                ],
                default: 'other'
              }
            }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: ratings.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      },
      statistics: stats[0] || { averageRating: 0, totalRatings: 0 },
      data: ratings
    });
  } catch (error) {
    console.error('Get restaurant ratings error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ratings',
      error: error.message
    });
  }
};

// @desc    Update user's rating for a restaurant
// @route   PUT /api/ratings/:id
// @access  Private
export const updateRating = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { foodItems, overallRating, review, experience } = req.body;
    
    // Find rating and verify ownership
    const rating = await Rating.findOne({ _id: id, user: userId });
    if (!rating) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Rating not found or you are not authorized to update it'
      });
    }
    
    // Update rating
    const updatedRating = await Rating.findByIdAndUpdate(
      id,
      { foodItems, overallRating, review, experience },
      {
        new: true,
        runValidators: true,
        session
      }
    ).populate([
      { path: 'restaurant', select: 'name' },
      { path: 'user', select: 'name email' }
    ]);
    
    // Update restaurant's average rating
    await updateRestaurantRating(rating.restaurant, session);
    
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: updatedRating
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Update rating error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID format'
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
      message: 'Server error while updating rating',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Delete user's rating
// @route   DELETE /api/ratings/:id
// @access  Private
export const deleteRating = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find rating and verify ownership
    const rating = await Rating.findOne({ _id: id, user: userId });
    if (!rating) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Rating not found or you are not authorized to delete it'
      });
    }
    
    const restaurantId = rating.restaurant;
    
    // Delete rating
    await Rating.findByIdAndDelete(id, { session });
    
    // Update restaurant's average rating
    await updateRestaurantRating(restaurantId, session);
    
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Delete rating error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting rating',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Helper function to update restaurant's average rating
export const updateRestaurantRating = async (restaurantId, session) => {
  const ratingStats = await Rating.aggregate([
    { $match: { restaurant: mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$overallRating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]).session(session);
  
  const stats = ratingStats[0] || { averageRating: 0, totalRatings: 0 };
  
  await Restaurant.findByIdAndUpdate(
    restaurantId,
    {
      'rating.average': Math.round(stats.averageRating * 10) / 10, // Round to 1 decimal
      'rating.totalRatings': stats.totalRatings
    },
    { session }
  );
};


