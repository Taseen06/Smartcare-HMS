const Test = require('../models/Test');

const getAllTests = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    let filter = { isActive: true };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const tests = await Test.find(filter).sort({ name: 1 });
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTest = async (req, res) => {
  try {
    const { name, description, price, duration, preparationInstructions, category } = req.body;
    const test = await Test.create({
      name, description, price, duration, preparationInstructions, category,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, message: 'Test deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllTests, getTestById, createTest, updateTest, deleteTest };
