import express from 'express';
import { 
  createPurchase, 
  getPurchases, 
  getPurchaseById, 
  updatePurchaseStatus 
} from '../controllers/FabricPurchase.controller.js';
import { protect } from '../middlewares/Auth.middleware.js';
import { authorize } from '../middlewares/Role.middleware.js';

const router = express.Router();

router.use(protect);

// Create Purchase (Customers and Tailors buy fabric)
router.post('/', authorize('Customer', 'Tailor'), createPurchase);

// Get History (Sales for Supplier, Orders for Customer)
router.get('/', getPurchases);

// Get Specific Order
router.get('/:id', getPurchaseById);

// Update Status (Supplier only)
router.put('/:id', authorize('Supplier'), updatePurchaseStatus);

export default router;