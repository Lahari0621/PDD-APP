const mongoose = require('mongoose');

const debateMessageSchema = new mongoose.Schema({
  debate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Debate',
    required: true,
    index: true,
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  // Fallacy detection results
  fallacies: [{
    type: {
      type: String,
      required: true,
    },
    name: String,
    description: String,
    highlightedText: String,
    startIndex: Number,
    endIndex: Number,
    confidence: Number,
    explanation: String,
    correction: String,
  }],
  hasFallacy: { type: Boolean, default: false },
  // Confidence & scoring
  confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
  logicScore: { type: Number, default: 0, min: 0, max: 100 },
  persuasionScore: { type: Number, default: 0, min: 0, max: 100 },
  // AI feedback
  feedback: { type: String, default: '' },
  counterArgument: { type: String, default: '' },
  // Turn number
  turnNumber: { type: Number, default: 1 },
  // Metadata
  processingTime: { type: Number, default: 0 }, // ms
  model: { type: String, default: 'gemini-1.5-flash' },
}, {
  timestamps: true,
});

debateMessageSchema.index({ debate: 1, createdAt: 1 });
debateMessageSchema.index({ sender: 1 });

module.exports = mongoose.model('DebateMessage', debateMessageSchema);
