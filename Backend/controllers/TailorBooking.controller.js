import TailorBooking from '../models/TailorBooking.model.js';
import { User } from '../models/User.model.js';

export const createBooking = async (req, res) => {
  try {
    const { 
      tailorId, 
      fabricId, 
      description, 
      dueDate, 
      contactNumber, 
      offeredPrice 
    } = req.body;

    // 1. Validate that the 'tailorId' is actually a Tailor
    const tailor = await User.findById(tailorId);
    if (!tailor || tailor.role !== 'Tailor') {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    // 2. Create the booking
    const booking = await TailorBooking.create({
      customer: req.user._id, // Retrieved from JWT
      tailor: tailorId,
      fabric: fabricId || null,
      description,
      dueDate,
      contactNumber,
      offeredPrice
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    let filter = {};

    // If User is Tailor -> Show jobs requested of them
    if (req.user.role === 'Tailor') {
      filter = { tailor: req.user._id };
    } 
    // If User is Customer -> Show bookings they made
    else {
      filter = { customer: req.user._id };
    }

    const bookings = await TailorBooking.find(filter)
      .populate('customer', 'name email')
      .populate('tailor', 'name specializations portfolio')
      .populate('fabric', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await TailorBooking.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('tailor', 'name specializations')
      .populate('fabric');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Security: Only the customer or the tailor involved can view it
    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isTailor = booking.tailor._id.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await TailorBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the assigned Tailor can update the status
    if (booking.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this booking' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};