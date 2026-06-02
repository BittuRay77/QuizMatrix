const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  prompt: { type: String, required: true },
  guidance: { type: String, required: true },
  tags: [{ type: String }],
}, { _id: false });

const AnswerAnalysisSchema = new mongoose.Schema({
  short_feedback: { type: String, default: '' },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  communication_score: { type: Number, default: 0 },
  relevance_score: { type: Number, default: 0 },
  technical_depth: { type: Number, default: 0 },
  behavioral_fit: { type: Number, default: 0 },
}, { _id: false });

const AnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  questionType: { type: String, required: true },
  questionText: { type: String, required: true },
  answerText: { type: String, required: true },
  transcript: { type: String, default: '' },
  timeSpentSeconds: { type: Number, default: 0 },
  analysis: { type: AnswerAnalysisSchema, default: () => ({}) },
}, { _id: false });

const FinalAnalysisSchema = new mongoose.Schema({
  confidence: { type: Number, default: 0 },
  communication_score: { type: Number, default: 0 },
  relevance_score: { type: Number, default: 0 },
  technical_depth: { type: Number, default: 0 },
  behavioral_fit: { type: Number, default: 0 },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  hr_email_response: { type: String, default: '' },
  summary: { type: String, default: '' },
  recommendation: { type: String, default: '' },
}, { _id: false });

const AIInterviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobRole: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
  interviewMode: { type: String, enum: ['without-resume', 'with-resume'], default: 'without-resume' },
  interviewType: { type: String, enum: ['technical', 'hr', 'pi'], default: 'technical' },
  resumeText: { type: String, default: '' },
  resumeInsights: { type: String, default: '' },
  resumeOriginalName: { type: String, default: '' },
  questions: { type: [QuestionSchema], default: [] },
  answers: { type: [AnswerSchema], default: [] },
  finalAnalysis: { type: FinalAnalysisSchema, default: null },
  status: { type: String, enum: ['draft', 'in-progress', 'completed'], default: 'draft', index: true },
  currentQuestionIndex: { type: Number, default: 0 },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('AIInterviewSession', AIInterviewSessionSchema);
