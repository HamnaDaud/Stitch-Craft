import express from 'express';
import { 
  createBooking, 
  getBookings, 
  getBookingById, 
  updateBookingStatus 
} from '../controllers/TailorBooking.controller.js';
import { protect } from '../middlewares/Auth.middleware.js';
import { authorize } from '../middlewares/Role.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Customer'), createBooking);

// Read: Get list of bookings (Context-aware)
router.get('/', getBookings);

router.get('/:id', getBookingById);

// Update: Only Tailors can accept/reject/complete jobs
router.put('/:id/status', authorize('Tailor'), updateBookingStatus);

export default router;