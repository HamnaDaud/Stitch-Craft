import FabricPurchase from '../models/FabricPurchase.model.js';
import Fabric from '../models/Fabric.model.js';

export const createPurchase = async (req, res) => {
  try {
    const { fabricId, quantity, deliveryAddress } = req.body;

    // 1. Verify Fabric exists
    const fabric = await Fabric.findById(fabricId);
    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }

    // 2. Check Stock Availability
    if (fabric.quantity < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${fabric.quantity} meters/units available.` 
      });
    }

    // 3. Calculate Total Price
    const totalPrice = fabric.price * quantity;

    // 4. Create Purchase Record
    const purchase = await FabricPurchase.create({
      customer: req.user._id,
      supplier: fabric.supplier, // Linked automatically from fabric
      fabric: fabricId,
      quantity,
      totalPrice,
      deliveryAddress
    });

    // 5. Update Fabric Inventory
    fabric.quantity -= quantity;
    if (fabric.quantity === 0) {
      fabric.isAvailable = false;
    }
    await fabric.save();

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPurchases = async (req, res) => {
  try {
    let filter = {};

    // Suppliers see SALES, Customers/Tailors see PURCHASES
    if (req.user.role === 'Supplier') {
      filter = { supplier: req.user._id };
    } else {
      filter = { customer: req.user._id };
    }

    const purchases = await FabricPurchase.find(filter)
      .populate('fabric', 'name fabricType price imageUrl')
      .populate('customer', 'name email')
      .populate('supplier', 'name shopName location')
      .sort({ createdAt: -1 });

    res.json({ count: purchases.length, purchases });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await FabricPurchase.findById(req.params.id)
      .populate('fabric')
      .populate('customer', 'name email')
      .populate('supplier', 'name shopName location');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    // Access Control
    const isBuyer = purchase.customer._id.toString() === req.user._id.toString();
    const isSeller = purchase.supplier._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to view this purchase' });
    }

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const purchase = await FabricPurchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    // Only the Supplier can update status
    if (purchase.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this order' });
    }

    // STOCK RESTORATION LOGIC
    // Check if we are cancelling for the first time
    if (status === 'Cancelled' && purchase.status !== 'Cancelled') {
      const fabric = await Fabric.findById(purchase.fabric);
      
      if (fabric) {
        // Add the quantity back
        fabric.quantity += purchase.quantity;
        fabric.isAvailable = true; 
        await fabric.save();
      }
    }

    purchase.status = status;
    const updatedPurchase = await purchase.save();

    res.json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};