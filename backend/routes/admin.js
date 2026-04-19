const express = require('express');
const router = express.Router();
const {
  getAllDoctors, removeDoctor, updateAdminKey, getAdminKey,
  getAdminTests, getTestRequests, updateAppointment, getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/doctors', getAllDoctors);
router.delete('/doctors/:id', removeDoctor);
router.put('/update-admin-key', updateAdminKey);
router.get('/admin-key', getAdminKey);
router.get('/tests', getAdminTests);
router.get('/tests/:testId/requests', getTestRequests);
router.put('/appointments/:id', updateAppointment);

module.exports = router;