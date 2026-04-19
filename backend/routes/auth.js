const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  updateProfileImage, 
  verifyOTP, 
  resendOTP 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register/:role', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/send-otp', resendOTP);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/profile-image', protect, updateProfileImage);

module.exports = router;