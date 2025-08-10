import Rating from '../models/ratingModel.js';
import Restaurant from '../models/restaurantModel.js';
import mongoose from 'mongoose';

// @desc    Create new rating
// @route   POST /api/ratings
// @access  Private
export const createRating = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { restaurant, foodItems, overallRating, review, experience } = req.body;
    const userId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }
    
    const restaurantDoc = await Restaurant.findOne({ 
      _id: restaurant, 
      isActive: true 
    }).session(session);
    
    if (!restaurantDoc) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    const existingRating = await Rating.findOne({ 
      restaurant, 
      user: userId 
    }).session(session);
    
    if (existingRating) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You have already rated this restaurant'
      });
    }
    
    const ratingData = {
      restaurant,
      user: userId,
      overallRating,
      review: review || '',
      experience: experience || {}
    };
    
    if (foodItems && foodItems.length > 0) {
      ratingData.foodItems = foodItems;
    }
    
    const rating = new Rating(ratingData);
    await rating.save({ session });
    
    // Update restaurant's average rating
    await updateRestaurantRating(restaurant, session);
    
    await session.commitTransaction();
    
    await rating.populate([
      { path: 'restaurant', select: 'name cuisine' },
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get restaurant ratings
// @route   GET /api/ratings/restaurant/:restaurantId
// @access  Public
export const getRestaurantRatings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }
    
    const query = { restaurant: restaurantId };
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const ratings = await Rating.find(query)
      .populate('user', 'name')
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Rating.countDocuments(query);
    
    // FIXED: Get rating statistics with proper ObjectId constructor
    const stats = await Rating.aggregate([
      { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } }, // FIXED: Added 'new'
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$overallRating' },
          totalRatings: { $sum: 1 },
          avgFood: { $avg: '$experience.food' },
          avgService: { $avg: '$experience.service' },
          avgDelivery: { $avg: '$experience.delivery' },
          ratingDistribution: {
            $push: '$overallRating'
          }
        }
      },
      {
        $project: {
          averageRating: { $round: ['$averageRating', 1] },
          totalRatings: 1,
          avgFood: { $round: ['$avgFood', 1] },
          avgService: { $round: ['$avgService', 1] },
          avgDelivery: { $round: ['$avgDelivery', 1] },
          ratingDistribution: {
            $let: {
              vars: {
                ratings: '$ratingDistribution'
              },
              in: {
                '5-star': {
                  $size: {
                    $filter: {
                      input: '$$ratings',
                      as: 'rating',
                      cond: { $eq: ['$$rating', 5] }
                    }
                  }
                },
                '4-star': {
                  $size: {
                    $filter: {
                      input: '$$ratings',
                      as: 'rating',
                      cond: { $eq: ['$$rating', 4] }
                    }
                  }
                },
                '3-star': {
                  $size: {
                    $filter: {
                      input: '$$ratings',
                      as: 'rating',
                      cond: { $eq: ['$$rating', 3] }
                    }
                  }
                },
                '2-star': {
                  $size: {
                    $filter: {
                      input: '$$ratings',
                      as: 'rating',
                      cond: { $eq: ['$$rating', 2] }
                    }
                  }
                },
                '1-star': {
                  $size: {
                    $filter: {
                      input: '$$ratings',
                      as: 'rating',
                      cond: { $eq: ['$$rating', 1] }
                    }
                  }
                }
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
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      },
      statistics: stats[0] || { 
        averageRating: 0, 
        totalRatings: 0,
        avgFood: 0,
        avgService: 0,
        avgDelivery: 0,
        ratingDistribution: {
          '5-star': 0, '4-star': 0, '3-star': 0, '2-star': 0, '1-star': 0
        }
      },
      data: ratings
    });
  } catch (error) {
    console.error('Get restaurant ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ratings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update rating
// @route   PUT /api/ratings/:id
// @access  Private
export const updateRating = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { foodItems, overallRating, review, experience } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID format'
      });
    }
    
    const rating = await Rating.findOne({ 
      _id: id, 
      user: userId 
    }).session(session);
    
    if (!rating) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Rating not found or unauthorized'
      });
    }
    
    const updateData = {
      overallRating,
      review: review || rating.review,
      experience: experience || rating.experience
    };
    
    if (foodItems) {
      updateData.foodItems = foodItems;
    }
    
    const updatedRating = await Rating.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
        session
      }
    ).populate([
      { path: 'restaurant', select: 'name cuisine' },
      { path: 'user', select: 'name email' }
    ]);
    
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
    res.status(500).json({
      success: false,
      message: 'Server error while updating rating',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
// @access  Private
export const deleteRating = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID format'
      });
    }
    
    const rating = await Rating.findOne({ 
      _id: id, 
      user: userId 
    }).session(session);
    
    if (!rating) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Rating not found or unauthorized'
      });
    }
    
    const restaurantId = rating.restaurant;
    
    await Rating.findByIdAndDelete(id, { session });
    await updateRestaurantRating(restaurantId, session);
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting rating',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// FIXED: Helper function to update restaurant rating
const updateRestaurantRating = async (restaurantId, session) => {
  try {
    const ratingStats = await Rating.aggregate([
      { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } }, // FIXED: Added 'new'
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
        'rating.average': Math.round(stats.averageRating * 10) / 10,
        'rating.totalRatings': stats.totalRatings
      },
      { session }
    );
  } catch (error) {
    console.error('Error updating restaurant rating:', error);
    throw error;
  }
};
