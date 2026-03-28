const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  preparationInstructions: { type: String },
  category: { type: String, enum: ['blood', 'imaging', 'cardiac', 'urine', 'other'], default: 'other' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
