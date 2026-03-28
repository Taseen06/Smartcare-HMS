const express = require('express');
const router = express.Router();
const {
  getAllDoctors, verifyDoctor, removeDoctor,
  getAdminTests, getTestRequests, updateAppointment, getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/doctors', getAllDoctors);
router.put('/doctors/:id/verify', verifyDoctor);
router.delete('/doctors/:id', removeDoctor);
router.get('/tests', getAdminTests);
router.get('/tests/:testId/requests', getTestRequests);
router.put('/appointments/:id', updateAppointment);

module.exports = router;
