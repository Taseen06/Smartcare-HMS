const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentType: { type: String, enum: ['doctor', 'test'], required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // "09:00"
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String },
  cancelReason: { type: String },
  bookingDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Validation: must have either doctor or test
appointmentSchema.pre('save', function(next) {
  if (this.appointmentType === 'doctor' && !this.doctor) {
    return next(new Error('Doctor appointment requires a doctor reference'));
  }
  if (this.appointmentType === 'test' && !this.test) {
    return next(new Error('Test appointment requires a test reference'));
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
