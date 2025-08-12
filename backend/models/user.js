
import mongoose from 'mongoose';

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
  }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);
export default User;
