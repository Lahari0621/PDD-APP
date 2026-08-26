const mongoose = require('mongoose');

/**
 * Tracks every question a user has answered so we can avoid repetition.
 */
const userQuizHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizQuestion',
    required: true,
  },
  quizResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizResult',
    default: null,
  },
  correct: {
    type: Boolean,
    required: true,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false,
});

// Compound index for fast "has this user seen this question recently?" lookups
userQuizHistorySchema.index({ userId: 1, questionId: 1, attemptedAt: -1 });
userQuizHistorySchema.index({ userId: 1, attemptedAt: -1 });

module.exports = mongoose.model('UserQuizHistory', userQuizHistorySchema);
