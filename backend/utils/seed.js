const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { Patient, Doctor, Admin } = require('../models/User');
const Test = require('../models/Test');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await mongoose.connection.collection('users').deleteMany({});
  await mongoose.connection.collection('tests').deleteMany({});
  await mongoose.connection.collection('appointments').deleteMany({});
  console.log('Cleared existing data');

  await Doctor.create([
    { name: 'Dr. Sarah Ahmed', email: 'sarah@smartcare.com', password: 'doctor123', role: 'doctor', specialization: 'Cardiology', experience: 12, consultationFee: 800, qualifications: 'MBBS, MD Cardiology', phone: '01700000001', isVerified: true, bio: 'Expert cardiologist with 12 years experience.' },
    { name: 'Dr. Rahim Khan', email: 'rahim@smartcare.com', password: 'doctor123', role: 'doctor', specialization: 'Neurology', experience: 8, consultationFee: 700, qualifications: 'MBBS, MS Neurology', phone: '01700000002', isVerified: true, bio: 'Specialist in neurological disorders.' },
    { name: 'Dr. Fatima Begum', email: 'fatima@smartcare.com', password: 'doctor123', role: 'doctor', specialization: 'Pediatrics', experience: 10, consultationFee: 500, qualifications: 'MBBS, DCH', phone: '01700000003', isVerified: true, bio: 'Dedicated pediatrician for children\'s health.' },
    { name: 'Dr. Arif Hossain', email: 'arif@smartcare.com', password: 'doctor123', role: 'doctor', specialization: 'Orthopedics', experience: 15, consultationFee: 900, qualifications: 'MBBS, MS Orthopedics', phone: '01700000004', isVerified: true, bio: 'Expert in bone and joint disorders.' },
  ]);

  const adminUser = await Admin.create({
    name: 'System Admin', email: 'admin@smartcare.com', password: 'admin123',
    role: 'admin', adminKey: process.env.ADMIN_KEY || 'SMARTCARE_ADMIN_2024', phone: '01900000001'
  });

  await Test.create([
    { name: 'Complete Blood Count (CBC)', description: 'Measures different components of blood including RBC, WBC and platelets', price: 350, duration: 30, category: 'blood', preparationInstructions: 'Fast for 8 hours before the test', createdBy: adminUser._id },
    { name: 'Chest X-Ray', description: 'Imaging test to examine lungs, heart and chest bones', price: 600, duration: 15, category: 'imaging', preparationInstructions: 'Remove all metal objects and jewelry', createdBy: adminUser._id },
    { name: 'ECG (Electrocardiogram)', description: 'Records electrical activity of the heart to detect cardiac issues', price: 400, duration: 20, category: 'cardiac', preparationInstructions: 'Avoid caffeine 24 hours before', createdBy: adminUser._id },
    { name: 'MRI Brain', description: 'Detailed magnetic resonance imaging of brain structures', price: 4500, duration: 60, category: 'imaging', preparationInstructions: 'Inform doctor about any metal implants. Remove all metallic objects.', createdBy: adminUser._id },
    { name: 'Urine Routine Examination', description: 'Routine microscopic and chemical examination of urine', price: 150, duration: 20, category: 'urine', preparationInstructions: 'Collect midstream urine in provided sterile container', createdBy: adminUser._id },
    { name: 'Blood Sugar (Fasting)', description: 'Measures blood glucose level after fasting period', price: 200, duration: 15, category: 'blood', preparationInstructions: 'Fast for at least 8-10 hours. Water is allowed.', createdBy: adminUser._id },
  ]);

  await Patient.create([
    { name: 'Karim Hossain', email: 'karim@gmail.com', password: 'patient123', role: 'patient', phone: '01800000001', address: 'Sylhet Sadar', dateOfBirth: new Date('1990-05-15') },
    { name: 'Nasrin Akter', email: 'nasrin@gmail.com', password: 'patient123', role: 'patient', phone: '01800000002', address: 'Dhaka, Gulshan', dateOfBirth: new Date('1985-08-22') },
    { name: 'Rafiq Islam', email: 'rafiq@gmail.com', password: 'patient123', role: 'patient', phone: '01800000003', address: 'Chittagong', dateOfBirth: new Date('1995-03-10') },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n--- Default Credentials ---');
  console.log('Admin:   admin@smartcare.com / admin123  (Admin Key: SMARTCARE_ADMIN_2024)');
  console.log('Doctor:  sarah@smartcare.com / doctor123');
  console.log('Patient: karim@gmail.com / patient123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
