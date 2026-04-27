import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getUsers,
    getUserById,
    getUserProfile, 
    updateUserProfile  
} from '../controllers/User.controller.js';
import { protect } from '../middlewares/Auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;