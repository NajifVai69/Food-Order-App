import mongoose from 'mongoose';

// Menu item schema (moved from user model)
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String // URL to image
  }
  ,
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisineType: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  location: {
    street: String,
    area: String,
    district: String,
    city: String
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  // Menu items now belong to restaurant
  menuItems: [menuItemSchema],
  
  // Restaurant description (moved from user profile)
  description: {
    type: String,
    default: ''
  },
  
  // Ratings and delivery (existing)
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  ratingBreakdown: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  estimatedDeliveryTime: {
    min: { type: Number, default: 30 },
    max: { type: Number, default: 45 }
  },
  deliveryFee: { type: Number, default: 60 },
  minOrderAmount: { type: Number, default: 200 },
  
  // Opening hours
  openingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  defaultOpeningHours: {
    open: { type: String, default: "10:00" },
    close: { type: String, default: "23:00" }
  }
}, { timestamps: true });

// Rating methods (keep existing)
restaurantSchema.methods.updateRating = function(newRating, oldRating = null) {
  if (oldRating) {
    this.ratingBreakdown[oldRating]--;//ager rating bad jehetu update
    this.ratingBreakdown[newRating]++;
  } else {
    this.ratingBreakdown[newRating]++;
    this.totalRatings++;
  }

  let totalScore = 0;
  let totalCount = 0;
  for (let star = 1; star <= 5; star++) {
    totalScore += star * this.ratingBreakdown[star];//total rating
    totalCount += this.ratingBreakdown[star];
  }

  this.averageRating = totalCount > 0 ? (totalScore / totalCount) : 0;
  this.totalRatings = totalCount;
};

restaurantSchema.methods.removeRating = function(rating) {
  if (this.ratingBreakdown[rating] > 0) {
    this.ratingBreakdown[rating]--;
    this.totalRatings--;
    
    let totalScore = 0;
    let totalCount = 0;
    for (let star = 1; star <= 5; star++) {
      totalScore += star * this.ratingBreakdown[star];
      totalCount += this.ratingBreakdown[star];
    }

    this.averageRating = totalCount > 0 ? (totalScore / totalCount) : 0;
    this.totalRatings = totalCount;
  }
};

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
