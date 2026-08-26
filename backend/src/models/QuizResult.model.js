const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  quizType: {
    type: String,
    enum: ['fallacy_identification', 'argument_analysis', 'logic_puzzle', 'debate_strategy'],
    required: true,
  },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  timeSpent: { type: Number, default: 0 }, // seconds
  answers: [{
    questionId: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
  }],
  xpEarned: { type: Number, default: 0 },
}, {
  timestamps: true,
});

quizResultSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
