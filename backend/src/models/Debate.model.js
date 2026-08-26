const mongoose = require('mongoose');

const debateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  topicCategory: {
    type: String,
    enum: ['politics', 'science', 'philosophy', 'ethics', 'economics', 'technology', 'social', 'environment', 'custom'],
    default: 'custom',
  },
  userPosition: { type: String, default: '' },
  aiPosition: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate',
  },
  aiPersonality: {
    type: String,
    enum: ['socratic', 'aggressive', 'empathetic', 'logical', 'devil_advocate'],
    default: 'logical',
  },
  // Debate mode
  debateMode: {
    type: String,
    enum: ['classic', 'cross_examination', 'rapid_fire'],
    default: 'classic',
  },
  adaptiveDifficulty: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active',
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DebateMessage',
  }],
  // Analytics
  totalTurns: { type: Number, default: 0 },
  userFallaciesCount: { type: Number, default: 0 },
  aiFallaciesCount: { type: Number, default: 0 },
  avgConfidenceScore: { type: Number, default: 0 },
  finalScore: { type: Number, default: 0 },
  winner: {
    type: String,
    enum: ['user', 'ai', 'draw', null],
    default: null,
  },
  // Summary
  summary: { type: String, default: '' },
  keyInsights: [{ type: String }],
  improvementAreas: [{ type: String }],
  strengths: [{ type: String }],
  // Duration
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  duration: { type: Number, default: 0 }, // in seconds
  // XP earned
  xpEarned: { type: Number, default: 0 },
}, {
  timestamps: true,
});

debateSchema.index({ user: 1, createdAt: -1 });
debateSchema.index({ status: 1 });
debateSchema.index({ topicCategory: 1 });

module.exports = mongoose.model('Debate', debateSchema);
