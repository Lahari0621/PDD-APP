const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  // Normalized version for dedup checking (lowercase, stripped punctuation)
  questionNormalized: {
    type: String,
    required: true,
    unique: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [(arr) => arr.length === 4, 'Must have exactly 4 options'],
  },
  // Index into options[] of the correct answer (0–3)
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    required: true,
    trim: true,
  },
  hint: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'logical_fallacies',
      'critical_thinking',
      'argument_analysis',
      'evidence_and_claims',
      'debate_strategy',
      'persuasion',
      'socratic_reasoning',
      'cognitive_biases',
      'counterarguments',
      'ethics',
      'philosophy',
      'communication',
      'decision_making',
      'logical_reasoning',
      'general_reasoning',
    ],
  },
  module: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  },
  // 'static' = hand-written seed, 'ai_generated' = produced by Gemini
  source: {
    type: String,
    enum: ['static', 'ai_generated'],
    default: 'static',
  },
  active: {
    type: Boolean,
    default: true,
  },
  timesAnswered: { type: Number, default: 0 },
  timesCorrect:  { type: Number, default: 0 },
}, {
  timestamps: true,
});

quizQuestionSchema.index({ category: 1, difficulty: 1 });
quizQuestionSchema.index({ module: 1 });
quizQuestionSchema.index({ active: 1 });

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
