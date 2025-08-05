import mongoose from "mongoose";

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
    required: true,
    enum: ['appetizers', 'main-course', 'desserts', 'beverages']
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  menuItems: [menuItemSchema],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  estimatedDeliveryTime: {
    type: Number,
    required: true,
    min: 15,
    max: 120
  },
  isActive: {
    type: Boolean,
    default: true
  },
  openingHours: {
    monday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '23:00' } 
    },
    tuesday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '23:00' } 
    },
    wednesday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '23:00' } 
    },
    thursday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '23:00' } 
    },
    friday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '23:00' } 
    },
    saturday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '23:00' } 
    },
    sunday: { 
      isOpen: { type: Boolean, default: true },
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '23:00' } 
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
restaurantSchema.index({ name: 'text'});
restaurantSchema.index({ 'rating.average': -1 });

export default mongoose.model('Restaurant', restaurantSchema);
