const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

exports.list = async (req, res) => {
  try {
    const categoryParam = req.query.category || req.params.category;
    let filter = {};

    if (categoryParam && categoryParam !== 'all' && categoryParam.trim() !== '') {
      const trimmed = categoryParam.trim();
      let categoryDoc = null;

      // 1. Check if valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(trimmed)) {
        categoryDoc = await Category.findById(trimmed);
      }

      // 2. If not found by ObjectId, search by name (case-insensitive)
      if (!categoryDoc) {
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        categoryDoc = await Category.findOne({
          name: { $regex: new RegExp(`^${escaped}$`, 'i') }
        });
      }

      if (categoryDoc) {
        filter.cat_id = categoryDoc._id;
      } else {
        // Explicit category specified but not found in DB -> return empty list
        return res.json([]);
      }
    }

    const products = await Product.find(filter).populate('cat_id', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('cat_id', 'name');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, Quantity, imgpath, categoryName } = req.body;

    if (!name || price === undefined || price === null || !categoryName) {
      return res.status(400).json({ message: 'الاسم والسعر والتصنيف حقول مطلوبة' });
    }

    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') }
    });

    if (!category) {
      return res.status(400).json({ message: `التصنيف "${categoryName}" غير موجود` });
    }

    const product = await Product.create({
      name: name.trim(),
      description: (description || '').trim(),
      price: Number(price),
      Quantity: Quantity !== undefined && Quantity !== '' ? Number(Quantity) : 0,
      imgpath: (imgpath || '').trim(),
      cat_id: category._id,
    });

    const populatedProduct = await Product.findById(product._id).populate('cat_id', 'name');
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      if (req.body.categoryName) {
        const category = await Category.findOne({ name: req.body.categoryName });
        if (category) {
          req.body.cat_id = category._id;
          delete req.body.categoryName;
        }
      }
      Object.assign(product, req.body);
      await product.save();
      const populatedProduct = await Product.findById(product._id).populate('cat_id', 'name');
      res.json(populatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
