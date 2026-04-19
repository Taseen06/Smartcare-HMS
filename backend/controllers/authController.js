const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User, Patient, Doctor, Admin } = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  });
};

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Smartcare HMS" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  });
};

// @route POST /api/auth/register/:role
const register = async (req, res) => {
  try {
    const { role } = req.params;
    const { name, email, password, phone, dateOfBirth, address,
            specialization, experience, qualifications, consultationFee,
            adminKey } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    let user;
    const userData = { name, email, password, phone, role, otp, otpExpires, isVerified: false };

    if (role === 'patient') {
      user = await Patient.create({ ...userData, dateOfBirth, address });
    } else if (role === 'doctor') {
      if (!specialization || !experience || !consultationFee) {
        return res.status(400).json({ success: false, message: 'Please provide all doctor details' });
      }
      user = await Doctor.create({
        ...userData,
        specialization, experience: Number(experience), qualifications,
        consultationFee: Number(consultationFee)
      });
    } else if (role === 'admin') {
      
      if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ success: false, message: 'Invalid admin key' });
      }
      user = await Admin.create({ ...userData, adminKey });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    try {
      await sendEmail({
        email: user.email,
        subject: 'Smartcare - Verify your email',
        message: `Your verification code is: ${otp}. It expires in 10 minutes.`
      });
      res.status(201).json({ success: true, message: 'OTP sent to email', email: user.email });
    } catch (err) {
      await User.findByIdAndDelete(user._id);
      res.status(500).json({ success: false, message: 'Error sending email. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      otp: otp.toString(), 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ success: true, message: 'Email verified!', token, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({ email: user.email, subject: 'Smartcare - New Code', message: `Your code is: ${otp}` });
    res.json({ success: true, message: 'OTP resent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }
    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ success: true, token, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/auth/profile-image
const updateProfileImage = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { profileImage: req.body.profileImage }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, verifyOTP, resendOTP, login, getMe, updateProfile, updateProfileImage };