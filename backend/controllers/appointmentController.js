const Appointment = require('../models/Appointment');
const { User } = require('../models/User');
const Test = require('../models/Test');

// Helper: check if date is Friday or outside working days (Sat-Thu)
const isValidWorkingDay = (date) => {
  const day = new Date(date).getDay(); // 0=Sun, 5=Fri, 6=Sat
  return day !== 5; // Friday is off
};

// Helper: check if time is within 8AM-10PM
const isValidWorkingHour = (timeSlot) => {
  const [hours] = timeSlot.split(':').map(Number);
  return hours >= 8 && hours < 22;
};

// Book doctor appointment
const bookDoctorAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;
    const patientId = req.user.id;

    if (!isValidWorkingDay(date)) {
      return res.status(400).json({ success: false, message: 'Friday is a holiday. Please select another day.' });
    }
    if (!isValidWorkingHour(timeSlot)) {
      return res.status(400).json({ success: false, message: 'Working hours are 8:00 AM - 10:00 PM' });
    }

    // Check for double booking on same slot
    const slotTaken = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date).toDateString(),
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    if (slotTaken) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    // One patient can book same doctor only once per day
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const alreadyBooked = await Appointment.findOne({
      patient: patientId,
      doctor: doctorId,
      date: { $gte: dateStart, $lte: dateEnd },
      status: { $ne: 'cancelled' }
    });
    if (alreadyBooked) {
      return res.status(400).json({ success: false, message: 'You already have an appointment with this doctor today' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentType: 'doctor',
      date: new Date(date),
      timeSlot,
      status: 'pending'
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization consultationFee');

    res.status(201).json({ success: true, appointment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Book test appointment
const bookTestAppointment = async (req, res) => {
  try {
    const { testId, date, timeSlot } = req.body;
    const patientId = req.user.id;

    if (!isValidWorkingDay(date)) {
      return res.status(400).json({ success: false, message: 'Friday is a holiday. Please select another day.' });
    }
    if (!isValidWorkingHour(timeSlot)) {
      return res.status(400).json({ success: false, message: 'Working hours are 8:00 AM - 10:00 PM' });
    }

    // Check slot for that test
    const slotTaken = await Appointment.findOne({
      test: testId,
      date: new Date(date).toDateString(),
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    if (slotTaken) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    // One patient can book same test only once per day
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const alreadyBooked = await Appointment.findOne({
      patient: patientId,
      test: testId,
      date: { $gte: dateStart, $lte: dateEnd },
      status: { $ne: 'cancelled' }
    });
    if (alreadyBooked) {
      return res.status(400).json({ success: false, message: 'You already have this test booked today' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      test: testId,
      appointmentType: 'test',
      date: new Date(date),
      timeSlot,
      status: 'pending'
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('test', 'name price duration');

    res.status(201).json({ success: true, appointment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient appointments
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name specialization consultationFee phone')
      .populate('test', 'name price duration')
      .sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctor appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const { date } = req.query;
    let filter = { doctor: req.user.id };
    if (date) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dateStart, $lte: dateEnd };
    }
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone dateOfBirth address')
      .sort({ date: 1, timeSlot: 1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get test appointments (admin)
const getTestAppointments = async (req, res) => {
  try {
    const { testId } = req.params;
    const { date } = req.query;
    let filter = { test: testId };
    if (date) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: dateStart, $lte: dateEnd };
    }
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('test', 'name price')
      .sort({ date: 1, timeSlot: 1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization check
    if (req.user.role === 'doctor' && appointment.doctor?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (appointment.patient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.reason || 'Cancelled by user';
    await appointment.save();
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available slots
const getAvailableSlots = async (req, res) => {
  try {
    const { date, type, id } = req.query;
    if (!date || !type || !id) {
      return res.status(400).json({ success: false, message: 'date, type, and id are required' });
    }

    if (!isValidWorkingDay(date)) {
      return res.json({ success: true, slots: [], message: 'Friday is a holiday' });
    }

    // Generate all 15-min slots from 8AM to 10PM
    const allSlots = [];
    for (let hour = 8; hour < 22; hour++) {
      for (let min = 0; min < 60; min += 15) {
        allSlots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
      }
    }

    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    let bookedSlots;
    if (type === 'doctor') {
      const appointments = await Appointment.find({
        doctor: id, date: { $gte: dateStart, $lte: dateEnd }, status: { $ne: 'cancelled' }
      });
      bookedSlots = appointments.map(a => a.timeSlot);
    } else {
      const appointments = await Appointment.find({
        test: id, date: { $gte: dateStart, $lte: dateEnd }, status: { $ne: 'cancelled' }
      });
      bookedSlots = appointments.map(a => a.timeSlot);
    }

    const availableSlots = allSlots.map(slot => ({
      time: slot,
      isBooked: bookedSlots.includes(slot)
    }));

    res.json({ success: true, slots: availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  bookDoctorAppointment, bookTestAppointment, getPatientAppointments,
  getDoctorAppointments, getTestAppointments, updateAppointmentStatus,
  cancelAppointment, getAvailableSlots
};
