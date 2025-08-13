import mongoose from 'mongoose';

// Address schema for customer delivery addresses and owner restaurant location
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

// Menu item schema for restaurant owners
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
});

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['Admin', 'Owner', 'Customer'],
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  // Common profile fields
  name: {
    type: String,
    default: ''
  },
  
  // Customer specific fields
  deliveryAddresses: [addressSchema],
  preferredLanguage: {
    type: String,
    enum: ['English', 'Bengali'],
    default: 'English'
  },
  
  // Owner specific fields
  restaurantName: {
    type: String,
    default: ''
  },
  restaurantDescription: {
    type: String,
    default: ''
  },
  menuItems: [menuItemSchema],
  restaurantLocation: addressSchema,
  
  // Profile completion status
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;