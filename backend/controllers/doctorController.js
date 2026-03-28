const { Doctor, User } = require('../models/User');
const Appointment = require('../models/Appointment');

const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let filter = { role: 'doctor', isVerified: true, isActive: true };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } }
    ];
    const doctors = await User.find(filter).select('-password -adminKey');
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updates = req.body;
    delete updates.password;
    delete updates.email;
    delete updates.role;
    const doctor = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllDoctors, getDoctorById, updateDoctorProfile };
