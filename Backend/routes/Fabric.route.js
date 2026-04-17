import express from 'express';
import { 
  addFabric, 
  getFabrics, 
  getMyFabrics, 
  updateFabric, 
  deleteFabric,
  getFabricsBySupplier,
  getFabricById,
  searchFabrics
} from '../controllers/Fabric.controller.js';
import { protect } from '../middlewares/Auth.middleware.js';
import { authorize } from '../middlewares/Role.middleware.js';

const router = express.Router();

// Public route for marketplace browsing
router.get('/search', protect, searchFabrics);
router.get('/', protect, getFabrics);
router.get('/supplier/:supplierId', protect, getFabricsBySupplier);

// Protected routes for Suppliers
router.get('/myfabrics', protect, authorize('Supplier'), getMyFabrics);
router.post('/', protect, authorize('Supplier'), addFabric);

// Dynamic ID routes
router.get('/:id', protect, getFabricById);
router.put('/:id', protect, authorize('Supplier'), updateFabric);
router.delete('/:id', protect, authorize('Supplier'), deleteFabric);

export default router;