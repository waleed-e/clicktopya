const Category = require('../models/Category');
const Product = require('../models/Product');

exports.list = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'اسم التصنيف مطلوب' });
    }
    const category = await Category.create({
      name: name.trim(),
      description: (description || '').trim(),
      image: (image || '').trim()
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      Object.assign(category, req.body);
      await category.save();
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      const productsCount = await Product.countDocuments({ cat_id: req.params.id });
      if (productsCount > 0) {
        return res.status(400).json({ message: 'Cannot delete category with products' });
      }
      await category.deleteOne();
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
