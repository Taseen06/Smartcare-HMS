const { User } = require('../models/User');
const Test = require('../models/Test');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeDoctor = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update admin key (system-wide)
const updateAdminKey = async (req, res) => {
  try {
    const { currentPassword, newAdminKey } = req.body;
    if (!currentPassword || !newAdminKey) {
      return res.status(400).json({ success: false, message: 'Current password and new admin key are required' });
    }
    if (newAdminKey.length < 8) {
      return res.status(400).json({ success: false, message: 'Admin key must be at least 8 characters' });
    }
    // Verify admin's own password first
    const admin = await User.findById(req.user.id).select('+password');
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    // Update env-level key isn't possible at runtime, so we store it on the admin user
    // and update the process.env so it takes effect for this session
    process.env.ADMIN_KEY = newAdminKey;
    // Also update all admin users' stored key
    await User.updateMany({ role: 'admin' }, { adminKey: newAdminKey });
    res.json({ success: true, message: 'Admin key updated successfully. Update your .env file to persist across restarts.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminTests = async (req, res) => {
  try {
    const tests = await Test.find().populate('createdBy', 'name email');
    // Add appointment counts
    const testsWithCounts = await Promise.all(tests.map(async (test) => {
      const count = await Appointment.countDocuments({ test: test._id, status: { $ne: 'cancelled' } });
      return { ...test.toObject(), appointmentCount: count };
    }));
    res.json({ success: true, tests: testsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTestRequests = async (req, res) => {
  try {
    const { testId } = req.params;
    const { date, status } = req.query;
    let filter = { test: testId };
    if (status) filter.status = status;
    if (date) {
      const dateStart = new Date(date); dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date); dateEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dateStart, $lte: dateEnd };
    }
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone dateOfBirth')
      .populate('test', 'name price duration')
      .sort({ date: 1, timeSlot: 1 });
    const total = await Appointment.countDocuments({ test: testId });
    res.json({ success: true, appointments, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name email phone')
      .populate('test', 'name price')
      .populate('doctor', 'name specialization');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [totalDoctors, totalPatients, totalTests, totalAppointments, pendingAppointments] = await Promise.all([
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: 'patient' }),
      Test.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' })
    ]);
    res.json({ success: true, stats: { totalDoctors, totalPatients, totalTests, totalAppointments, pendingAppointments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllDoctors, removeDoctor, updateAdminKey, getAdminTests, getTestRequests, updateAppointment, getDashboardStats };