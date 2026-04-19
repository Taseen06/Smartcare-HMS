const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const testRoutes = require('./routes/tests');
const appointmentRoutes = require('./routes/appointments');
const slotRoutes = require('./routes/slots');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing - MUST be before rate limiter for large payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting - after body parsing
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path === '/api/auth/profile-image' // Skip rate limit for file uploads
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smartcare HMS API is running' });
});

// Diagnostic endpoint for testing image upload
app.post('/api/debug/test-image-upload', (req, res) => {
  try {
    const { profileImage } = req.body;
    const size = profileImage ? profileImage.length : 0;
    console.log('Debug endpoint: Received image data');
    console.log('  - Size:', size, 'bytes');
    console.log('  - Is base64:', profileImage?.startsWith('data:image/'));
    console.log('  - Type:', profileImage?.substring(0, 30));
    
    if (!profileImage) {
      return res.status(400).json({ success: false, message: 'No image data' });
    }
    if (size > 2800000) {
      return res.status(413).json({ success: false, message: `Image too large: ${size} bytes (max 2800000)` });
    }
    if (!profileImage.startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'Invalid format' });
    }
    
    res.json({ 
      success: true, 
      message: 'Image data looks good!',
      sizeBytes: size,
      sizeMB: (size / 1024 / 1024).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = Number(process.env.PORT) || 5001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Smartcare HMS Server running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error('   Stop the process using that port, or start the backend with a different PORT value.');
    console.error('   Example: PORT=5001 npm run dev');
    process.exit(1);
  }

  console.error('❌ Server startup error:', error);
  process.exit(1);
});
