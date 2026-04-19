// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updateProfileImage } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register/:role', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/profile-image', protect, updateProfileImage);

module.exports = router;