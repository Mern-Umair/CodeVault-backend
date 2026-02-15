const Category = require('../models/categoryModel');

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({
      name,
      description,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};