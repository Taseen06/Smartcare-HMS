const express = require('express');
const router = express.Router();
const { getAllTests, getTestById, createTest, updateTest, deleteTest } = require('../controllers/testController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllTests);
router.get('/:id', getTestById);
router.post('/', protect, authorize('admin'), createTest);
router.put('/:id', protect, authorize('admin'), updateTest);
router.delete('/:id', protect, authorize('admin'), deleteTest);

module.exports = router;
