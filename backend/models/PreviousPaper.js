const mongoose = require('mongoose');

const PreviousPaperSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true, index: true },
  year: { type: String, required: true, trim: true, index: true },
  country: { type: String, required: true, trim: true, index: true },
  state: { type: String, required: true, trim: true, index: true },
  college: { type: String, required: true, trim: true, index: true },
  branch: { type: String, required: true, trim: true, index: true },
  semester: { type: String, required: true, trim: true, index: true },
  fileUrl: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  downloadCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('PreviousPaper', PreviousPaperSchema);
