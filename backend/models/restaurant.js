import mongoose from 'mongoose';

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
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null until assigned
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
