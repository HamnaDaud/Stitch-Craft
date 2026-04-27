import { User, Tailor, Customer, Supplier } from '../models/User.model.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role, ...extraData } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    let normalizedRole = 'Customer';
    if (role) {
      normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }

    let user;
    if (normalizedRole === 'Tailor') {
      user = await Tailor.create({ name, email, password, role: 'Tailor', ...extraData });
    } else if (normalizedRole === 'Supplier') {
      user = await Supplier.create({ name, email, password, role: 'Supplier', ...extraData });
    } else {
      user = await Customer.create({ name, email, password, role: 'Customer', ...extraData });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      role: user.role,
      message: "Registration successful. Please log in."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      token: generateToken(user._id) 
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

export const getUserProfile = async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Handle role-specific updates based on the discriminator
    if (user.role === 'Tailor') {
      user.specializations = req.body.specializations || user.specializations;
      user.portfolio = req.body.portfolio || user.portfolio;
    } 
    else if (user.role === 'Customer') {
      user.measurements = req.body.measurements || user.measurements;
    } 
    else if (user.role === 'Supplier') {
      user.shopName = req.body.shopName || user.shopName;
      user.fabricTypes = req.body.fabricTypes || user.fabricTypes;
      user.location = req.body.location || user.location;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      // Return the specific data too
      details: updatedUser
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    const filter = {};
    if (role) {
      const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      filter.role = normalizedRole;
    }

    // Find users based on filter, exclude passwords
    const users = await User.find(filter).select('-password');
    
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid User ID format' });
  }
};
