const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    // Optionally send email here via nodemailer
    res.json({ success: true, message: 'Message received! We will contact you soon.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
