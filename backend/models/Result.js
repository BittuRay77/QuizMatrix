const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: Number, default: null },
  originalOptionIndex: { type: Number, default: null },
}, { _id: false });

const ResultSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: [AnswerSchema], default: [] },
  obtainedMarks: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  setNumber: { type: Number, default: 1 },
  questionOrder: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

ResultSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);
