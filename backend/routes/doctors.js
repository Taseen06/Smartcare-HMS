const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, updateDoctorProfile } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', protect, authorize('doctor'), updateDoctorProfile);

module.exports = router;
