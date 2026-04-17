import mongoose from 'mongoose';

const fabricSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, "Fabric name is required"],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  fabricType: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    required: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Fabric = mongoose.model('Fabric', fabricSchema);
export default Fabric;