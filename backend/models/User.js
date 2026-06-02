const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  department: { type: String },
  college: { type: String, trim: true, index: true },
  branch: { type: String, trim: true, index: true },
  section: { type: String, trim: true, index: true },
  rollNumber: { type: String },
  className: { type: String },
  semester: { type: String },
  
  profileImage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
