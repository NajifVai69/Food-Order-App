import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
    },
  ],
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'bKash', 'Nagad', 'Card'], required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Delivered', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);
