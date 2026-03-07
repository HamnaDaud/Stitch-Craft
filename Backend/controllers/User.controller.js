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

