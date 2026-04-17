import mongoose from 'mongoose';

const fabricPurchaseSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fabric: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fabric',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

const FabricPurchase = mongoose.model('FabricPurchase', fabricPurchaseSchema);
export default FabricPurchase;