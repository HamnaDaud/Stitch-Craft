import mongoose from 'mongoose';

const tailorBookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fabric: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fabric', 
    required: false // Optional, in case they provide their own fabric not in system
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  offeredPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed'],
    default: 'Pending'
  }
}, { timestamps: true });

const TailorBooking = mongoose.model('TailorBooking', tailorBookingSchema);
export default TailorBooking;