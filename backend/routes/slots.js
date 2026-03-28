// slots.js
const express = require('express');
const router = express.Router();
const { getAvailableSlots } = require('../controllers/appointmentController');

router.get('/available', getAvailableSlots);

module.exports = router;
