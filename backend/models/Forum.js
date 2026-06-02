const mongoose = require('mongoose');

const ForumReplySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  parentReply: { type: mongoose.Schema.Types.ObjectId, default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isBestAnswer: { type: Boolean, default: false },
}, { timestamps: true });

const ForumSchema = new mongoose.Schema({
  title: { type: String, default: 'Discussion', trim: true },
  content: { type: String, required: true, trim: true },
  subject: { type: String, default: 'General', trim: true, index: true },
  tags: [{ type: String, trim: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  isSolved: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false },
  replies: { type: [ForumReplySchema], default: [] },
}, { timestamps: true });

ForumSchema.index({ title: 'text', content: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('Forum', ForumSchema);
