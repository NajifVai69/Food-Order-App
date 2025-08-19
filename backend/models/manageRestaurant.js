import mongoose from 'mongoose';

const manageRestaurantSchema = new mongoose.Schema({
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
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // admin
  createdAt: { type: Date, default: Date.now }
});

const ManageRestaurant = mongoose.model('ManageRestaurant', manageRestaurantSchema);
export default ManageRestaurant;
