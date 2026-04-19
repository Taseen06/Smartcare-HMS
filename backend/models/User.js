const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
  phone: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true, discriminatorKey: 'role' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

// Patient discriminator
const patientSchema = new mongoose.Schema({
  dateOfBirth: { type: Date },
  address: { type: String },
  medicalHistory: [{ type: String }],
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }]
});
const Patient = User.discriminator('patient', patientSchema);

// Doctor discriminator
const doctorSchema = new mongoose.Schema({
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  qualifications: { type: String },
  consultationFee: { type: Number, required: true },
  availableSlots: [{
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String }
  }],
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
  bio: { type: String }
});
const Doctor = User.discriminator('doctor', doctorSchema);

// Admin discriminator
const adminSchema = new mongoose.Schema({
  adminKey: { type: String },
  permissions: [{ type: String }]
});
const Admin = User.discriminator('admin', adminSchema);

module.exports = { User, Patient, Doctor, Admin };