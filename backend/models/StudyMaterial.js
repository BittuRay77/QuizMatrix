const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject: { type: String, required: true, trim: true, index: true },
  type: { type: String, default: 'notes' },
  fileUrl: { type: String, default: '' },
  content: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetCollegeScope: { type: String, enum: ['self', 'all'], default: 'self', index: true },
  targetCollegeName: { type: String, trim: true, default: '', index: true },
  targetStream: { type: String, trim: true, required: true, index: true },
  targetSection: { type: String, trim: true, default: '', index: true },
  viewCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
