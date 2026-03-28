const express = require('express');
const router = express.Router();
const {
  bookDoctorAppointment, bookTestAppointment, getPatientAppointments,
  getDoctorAppointments, getTestAppointments, updateAppointmentStatus,
  cancelAppointment, getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/doctor', protect, authorize('patient'), bookDoctorAppointment);
router.post('/test', protect, authorize('patient'), bookTestAppointment);
router.get('/patient', protect, authorize('patient'), getPatientAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/test/:testId', protect, authorize('admin'), getTestAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);
router.delete('/:id', protect, cancelAppointment);
router.get('/available-slots', getAvailableSlots);

module.exports = router;
