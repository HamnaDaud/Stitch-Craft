import Fabric from '../models/Fabric.model.js';
import { User } from '../models/User.model.js';

export const addFabric = async (req, res) => {
  try {
    const { name, description, fabricType, price, quantity, imageUrl } = req.body;

    const fabric = await Fabric.create({
      supplier: req.user._id,
      name,
      description,
      fabricType,
      price,
      quantity,
      imageUrl
    });

    res.status(201).json(fabric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getFabrics = async (req, res) => {
  try {
    const filter = req.query.type ? { fabricType: req.query.type } : {};
    const fabrics = await Fabric.find(filter).populate('supplier', 'name shopName location');
    res.json(fabrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyFabrics = async (req, res) => {
  try {
    const queryObj = { supplier: req.user._id };

    if (req.query.type) {
      queryObj.fabricType = req.query.type;
    }

    if (req.query.search) {
      queryObj.name = { $regex: req.query.search, $options: 'i' };
    }

    const fabrics = await Fabric.find(queryObj);

    res.json({
      count: fabrics.length,
      fabrics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);

    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }

    if (fabric.supplier.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this fabric' });
    }

    const updatedFabric = await Fabric.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedFabric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);

    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }

    if (fabric.supplier.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this fabric' });
    }

    await fabric.deleteOne();
    res.json({ message: 'Fabric removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFabricById = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id).populate('supplier', 'name shopName location');

    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }

    res.json(fabric);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Fabric ID format' });
  }
};

export const getFabricsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { type } = req.query;

    // Filter by supplier and optionally by fabric type
    const queryObj = { supplier: supplierId };
    if (type) {
      queryObj.fabricType = type;
    }

    const fabrics = await Fabric.find(queryObj).populate('supplier', 'name shopName location');

    if (!fabrics) {
      return res.status(404).json({ message: 'No fabrics found for this supplier' });
    }

    res.json({
      count: fabrics.length,
      fabrics
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid Supplier ID format' });
  }
};

export const searchFabrics = async (req, res) => {
  try {
    const { q, sort } = req.query;
    let query = { isAvailable: true };

    if (q) {
      const searchRegex = new RegExp(q, 'i');

      // 1. Find Suppliers matching the name
      const matchingSuppliers = await User.find({ 
        name: searchRegex, 
        role: 'Supplier' 
      }).select('_id');

      const supplierIds = matchingSuppliers.map(user => user._id);

      // 2. Build the OR query (Name OR Type OR Supplier)
      query.$or = [
        { name: searchRegex },        // Match Fabric Name
        { fabricType: searchRegex },  // Match Fabric Type
        { supplier: { $in: supplierIds } } // Match Supplier Name
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'lowToHigh') sortOption = { price: 1 };
    if (sort === 'highToLow') sortOption = { price: -1 };

    const fabrics = await Fabric.find(query)
      .populate('supplier', 'name shopName')
      .sort(sortOption);

    res.json(fabrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};