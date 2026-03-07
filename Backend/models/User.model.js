import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const baseOptions = {
  discriminatorKey: 'role', 
  collection: 'users',
  timestamps: true
};

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String,
    required: true, 
    enum: ['Tailor', 'Customer', 'Supplier'], 
    default: 'Customer'
  }
}, baseOptions);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// --- Role Specific Schemas ---

const Tailor = User.discriminator('Tailor', new mongoose.Schema({
  specializations: [String],
  isVerified: { type: Boolean, default: false },
  portfolio: [{ imageUrl: String, description: String }]
}));


const Customer = User.discriminator('Customer', new mongoose.Schema({
  measurements: {
    height: Number,
    chest: Number,
    waist: Number,
    history: [Object]
  }
}));


const Supplier = User.discriminator('Supplier', new mongoose.Schema({
  shopName: String,
  fabricTypes: [String],
  location: String
}));

export { User, Tailor, Customer, Supplier };