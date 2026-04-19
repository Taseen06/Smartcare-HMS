const jwt = require('jsonwebtoken');
const { User, Patient, Doctor, Admin } = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @route POST /api/auth/register/:role
const register = async (req, res) => {
  try {
    const { role } = req.params;
    const { name, email, password, phone, dateOfBirth, address,
            specialization, experience, qualifications, consultationFee,
            adminKey } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    let user;

    if (role === 'patient') {
      user = await Patient.create({ name, email, password, phone, role: 'patient', dateOfBirth, address });
    } else if (role === 'doctor') {
      if (!specialization || !experience || !consultationFee) {
        return res.status(400).json({ success: false, message: 'Please provide all doctor details' });
      }
      user = await Doctor.create({
        name, email, password, phone, role: 'doctor',
        specialization, experience: Number(experience), qualifications,
        consultationFee: Number(consultationFee), isVerified: true
      });
    } else if (role === 'admin') {
      if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ success: false, message: 'Invalid admin key' });
      }
      user = await Admin.create({ name, email, password, phone, role: 'admin', adminKey });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ success: true, token, user: userObj });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Convert to plain object and remove password for security
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'dateOfBirth', 'bio', 'qualifications', 'consultationFee', 'experience'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/auth/profile-image
// Accepts base64 string - no multer needed, stored directly in DB
const updateProfileImage = async (req, res) => {
  try {
    const { profileImage } = req.body;
    
    if (!profileImage) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }
    
    // Validate it's a base64 image (data URI)
    if (!profileImage.startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'Invalid image format. Must be a base64 data URI.' });
    }
    
    // Rough size check: base64 ~1.37x raw size. Limit to ~2MB raw → ~2.7MB base64
    if (profileImage.length > 2800000) {
      return res.status(413).json({ success: false, message: 'Image too large. Please use an image under 2MB.' });
    }
    
    console.log(`📸 Updating profile image for user ${req.user.id}, size: ${profileImage.length} bytes`);
    
    // Update using findByIdAndUpdate with explicit runValidators disabled for large data
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { profileImage }, 
      { new: true, runValidators: false }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log(`✅ Profile image updated successfully for ${user.email}`);
    console.log(`   Saved data size: ${user.profileImage?.length || 0} bytes`);
    
    // Return the user object directly (don't use toJSON to preserve all fields)
    // Manually remove password for security
    const userResponse = user.toObject();
    delete userResponse.password;
    
    console.log(`   Response includes profileImage: ${!!userResponse.profileImage}`);
    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image: ' + error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, updateProfileImage };