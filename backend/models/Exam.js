const mongoose = require('mongoose');

const ExamOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
  originalIndex: { type: Number, default: 0 },
}, { _id: false });

const ExamQuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['single_correct', 'multiple_correct', 'true_false', 'short_answer', 'descriptive', 'mcq'],
    default: 'single_correct',
  },
  question: { type: String, required: true },
  options: { type: [ExamOptionSchema], default: [] },
  shortAnswer: { type: String, default: '' },
  descriptiveAnswer: { type: String, default: '' },
  marks: { type: Number, default: 1 },
  timePerQuestion: { type: Number, default: 60 },
}, { _id: true });

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  instructions: { type: String, default: '' },
  duration: { type: Number, required: true },
  passingMarks: { type: Number, default: 0 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examKey: { type: String, required: true, unique: true, index: true },
  questions: { type: [ExamQuestionSchema], default: [] },
  totalMarks: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'completed'], default: 'draft', index: true },
  allowedColleges: [{ type: String, trim: true, index: true }],
  allowedBranches: [{ type: String, trim: true, index: true }],
  allowedSections: [{ type: String, trim: true, index: true }],
  allowedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  publishedAt: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
